/**
 * Type Mappers
 * Converts API response types to frontend schema types
 * 
 * Why this exists:
 * - API types use `null` for optional fields (from Python/DB)
 * - Frontend schema types use `undefined` for optional fields (TypeScript convention)
 * - `role` in API is `string`, but frontend expects `UserRole` union type
 * 
 * This file provides clean, type-safe conversions between the two.
 */

import type { User } from "./usersApi";
import type { PrimaryTag } from "./primaryTagsApi";
import type { SecondaryTag } from "./secondaryTagsApi";
import type { Contact } from "./contactsApi";
import type { UserData, UserRole } from "../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../schemas/tagTypes";
import type { ContactData } from "../schemas/contactTypes";

/**
 * Convert API User to frontend UserData
 */
export const mapUserToUserData = (user: User): UserData => ({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    role: user.role as UserRole, // API returns string, we cast to UserRole
    color: user.color,
    profileImage: user.profileImage,
    nickname: user.nickname,
});

/**
 * Convert API User array to UserData array
 */
export const mapUsersToUserData = (users: User[]): UserData[] =>
    users.map(mapUserToUserData);

/**
 * Convert API PrimaryTag to frontend PrimaryTagData
 */
export const mapPrimaryTagToData = (tag: PrimaryTag): PrimaryTagData => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    description: tag.description ?? undefined, // null -> undefined
});

/**
 * Convert API PrimaryTag array to PrimaryTagData array
 */
export const mapPrimaryTagsToData = (tags: PrimaryTag[]): PrimaryTagData[] =>
    tags.map(mapPrimaryTagToData);

/**
 * Convert API SecondaryTag to frontend SecondaryTagData
 */
export const mapSecondaryTagToData = (tag: SecondaryTag): SecondaryTagData => ({
    id: tag.id,
    name: tag.name,
    primaryTagId: tag.primaryTagId,
    description: tag.description ?? undefined, // null -> undefined
});

/**
 * Convert API SecondaryTag array to SecondaryTagData array
 */
export const mapSecondaryTagsToData = (tags: SecondaryTag[]): SecondaryTagData[] =>
    tags.map(mapSecondaryTagToData);

/**
 * Convert API Contact to frontend ContactData
 */
export const mapContactToData = (contact: Contact): ContactData => ({
    id: contact.id,
    name: contact.fullName,
    role: contact.position ?? "",
    phone: contact.phoneNumber ?? "",
    primaryTags: contact.primaryTagIds ?? [],
});

/**
 * Convert API Contact array to ContactData array
 */
export const mapContactsToData = (contacts: Contact[]): ContactData[] =>
    contacts.map(mapContactToData);
