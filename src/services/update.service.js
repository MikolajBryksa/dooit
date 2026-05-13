import {Platform, Linking} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {logError} from '@/services/errors.service';

const VERSION_URL =
  'https://raw.githubusercontent.com/MikolajBryksa/dooit/main/package.json';
const FETCH_TIMEOUT_MS = 5000;

function isNewer(remoteVersion, currentVersion) {
  const toParts = version =>
    String(version)
      .split('.')
      .map(part => parseInt(part, 10) || 0);
  const remoteParts = toParts(remoteVersion);
  const currentParts = toParts(currentVersion);
  const partCount = Math.max(remoteParts.length, currentParts.length);
  for (let i = 0; i < partCount; i++) {
    const remotePart = remoteParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (remotePart > currentPart) return true;
    if (remotePart < currentPart) return false;
  }
  return false;
}

export async function checkForUpdate() {
  if (Platform.OS !== 'android') return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(VERSION_URL, {
      signal: controller.signal,
      headers: {Accept: 'application/json'},
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const {version: latestVersion} = await response.json();
    if (!latestVersion) return null;
    const currentVersion = DeviceInfo.getVersion();
    if (!isNewer(latestVersion, currentVersion)) return null;
    const bundleId = DeviceInfo.getBundleId();
    return () =>
      Linking.openURL(`market://details?id=${bundleId}`).catch(() =>
        Linking.openURL(
          `https://play.google.com/store/apps/details?id=${bundleId}`,
        ).catch(e => logError(e, 'openPlayStore')),
      );
  } catch {
    return null;
  }
}
