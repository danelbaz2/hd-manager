"""
Convert Markdown to Word Document (.docx)
"""
import markdown
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
import re

def md_to_docx(md_file, docx_file):
    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create Word document
    doc = Document()
    
    # Set default font
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    
    # Process line by line
    lines = md_content.split('\n')
    in_code_block = False
    code_content = []
    in_table = False
    table_rows = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Code block handling
        if line.strip().startswith('```'):
            if in_code_block:
                # End code block
                code_text = '\n'.join(code_content)
                p = doc.add_paragraph()
                p.style = 'Normal'
                run = p.add_run(code_text)
                run.font.name = 'Consolas'
                run.font.size = Pt(9)
                code_content = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue
        
        if in_code_block:
            code_content.append(line)
            i += 1
            continue
        
        # Table handling
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            
            # Skip separator lines
            if re.match(r'^\|[\s\-:|]+\|$', line.strip()):
                i += 1
                continue
            
            # Parse table row
            cells = [c.strip() for c in line.split('|')[1:-1]]
            table_rows.append(cells)
            i += 1
            continue
        elif in_table:
            # End of table, create it
            if table_rows:
                num_cols = max(len(row) for row in table_rows)
                table = doc.add_table(rows=len(table_rows), cols=num_cols)
                table.style = 'Table Grid'
                for row_idx, row_data in enumerate(table_rows):
                    for col_idx, cell_text in enumerate(row_data):
                        if col_idx < num_cols:
                            table.rows[row_idx].cells[col_idx].text = clean_md(cell_text)
                doc.add_paragraph()
            in_table = False
            table_rows = []
        
        # Empty line
        if not line.strip():
            i += 1
            continue
        
        # Headers
        if line.startswith('# '):
            doc.add_heading(clean_md(line[2:]), level=0)
        elif line.startswith('## '):
            doc.add_heading(clean_md(line[3:]), level=1)
        elif line.startswith('### '):
            doc.add_heading(clean_md(line[4:]), level=2)
        elif line.startswith('#### '):
            doc.add_heading(clean_md(line[5:]), level=3)
        elif line.startswith('> '):
            # Blockquote
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.5)
            p.add_run(clean_md(line[2:])).italic = True
        elif line.startswith('- ') or line.startswith('* '):
            # Bullet list
            doc.add_paragraph(clean_md(line[2:]), style='List Bullet')
        elif re.match(r'^\d+\. ', line):
            # Numbered list
            text = re.sub(r'^\d+\. ', '', line)
            doc.add_paragraph(clean_md(text), style='List Number')
        elif line.startswith('---'):
            # Horizontal rule - add empty paragraph
            doc.add_paragraph('─' * 50)
        else:
            # Regular paragraph
            p = doc.add_paragraph()
            add_formatted_text(p, line)
        
        i += 1
    
    # Handle final table if exists
    if in_table and table_rows:
        num_cols = max(len(row) for row in table_rows)
        table = doc.add_table(rows=len(table_rows), cols=num_cols)
        table.style = 'Table Grid'
        for row_idx, row_data in enumerate(table_rows):
            for col_idx, cell_text in enumerate(row_data):
                if col_idx < num_cols:
                    table.rows[row_idx].cells[col_idx].text = clean_md(cell_text)
    
    # Save document
    doc.save(docx_file)
    print(f'Created: {docx_file}')

def clean_md(text):
    """Remove markdown formatting"""
    # Remove bold/italic markers
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    # Remove links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    return text.strip()

def add_formatted_text(paragraph, text):
    """Add text with basic formatting preserved"""
    # Simple approach - just add cleaned text
    paragraph.add_run(clean_md(text))

if __name__ == '__main__':
    md_to_docx(
        'system-specification/HD-Manager-SRS-Updated.md',
        'system-specification/HD-Manager-SRS-Updated.docx'
    )
