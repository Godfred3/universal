// src/hooks/use-permissions.ts
// ─────────────────────────────────────────────────────────────────────────────
// A centralized hook for requesting all app permissions.
// Import and use individual request functions wherever needed.
// ─────────────────────────────────────────────────────────────────────────────

import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

// ── Contacts ──────────────────────────────────────────────────────────────────
export async function requestContactsPermission(): Promise<PermissionStatus> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status as PermissionStatus;
}

export async function getContactsPermission(): Promise<PermissionStatus> {
  const { status } = await Contacts.getPermissionsAsync();
  return status as PermissionStatus;
}

// ── Camera ────────────────────────────────────────────────────────────────────
export async function requestCameraPermission(): Promise<PermissionStatus> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status as PermissionStatus;
}

export async function getCameraPermission(): Promise<PermissionStatus> {
  const { status } = await Camera.getCameraPermissionsAsync();
  return status as PermissionStatus;
}

// ── Microphone ────────────────────────────────────────────────────────────────
export async function requestMicrophonePermission(): Promise<PermissionStatus> {
  const { status } = await Audio.requestPermissionsAsync();
  return status as PermissionStatus;
}

export async function getMicrophonePermission(): Promise<PermissionStatus> {
  const { status } = await Audio.getPermissionsAsync();
  return status as PermissionStatus;
}

// ── Media Library / Storage ───────────────────────────────────────────────────
export async function requestMediaLibraryPermission(): Promise<PermissionStatus> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status as PermissionStatus;
}

export async function getMediaLibraryPermission(): Promise<PermissionStatus> {
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status as PermissionStatus;
}

// ── Request All At Once ───────────────────────────────────────────────────────
export interface AllPermissionsStatus {
  contacts: PermissionStatus;
  camera: PermissionStatus;
  microphone: PermissionStatus;
  mediaLibrary: PermissionStatus;
}

export async function requestAllPermissions(): Promise<AllPermissionsStatus> {
  const [contacts, camera, microphone, mediaLibrary] = await Promise.all([
    requestContactsPermission(),
    requestCameraPermission(),
    requestMicrophonePermission(),
    requestMediaLibraryPermission(),
  ]);

  return { contacts, camera, microphone, mediaLibrary };
}
