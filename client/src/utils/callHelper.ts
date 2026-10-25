/**
 * Emergency calling helper for Marine AI
 * Bridges to Android native phone dialer via AndroidBridge if running in Capacitor APK,
 * or browser tel: protocol if running in web view.
 */

export function triggerEmergencyCall(phoneNumber: string = '8122566828', reason: string = 'IMBL Border Crossing'): void {
  console.log(`[MarineAI Emergency Call] Triggering call to ${phoneNumber} (${reason})...`);

  // 1. Trigger haptic emergency vibration if available
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([500, 250, 500, 250, 1000]);
    }
  } catch (e) {
    // Ignore vibration errors
  }

  // 2. Android Native Bridge (Capacitor WebView JavaScript Interface)
  try {
    const bridge = (window as unknown as { AndroidBridge?: { makeCall?: (num: string) => void } }).AndroidBridge;
    if (bridge && typeof bridge.makeCall === 'function') {
      console.log('[MarineAI Emergency Call] Executing native AndroidBridge.makeCall');
      bridge.makeCall(phoneNumber);
      return;
    }
  } catch (e) {
    console.warn('[MarineAI Emergency Call] AndroidBridge error:', e);
  }

  // 3. Programmatic link click (standard mobile browser dialer dispatch)
  try {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const callLink = document.createElement('a');
    callLink.href = `tel:${cleanNumber}`;
    callLink.target = '_self';
    callLink.rel = 'noopener noreferrer';
    callLink.style.display = 'none';
    document.body.appendChild(callLink);
    callLink.click();
    setTimeout(() => {
      try {
        document.body.removeChild(callLink);
      } catch {
        // noop
      }
    }, 500);
  } catch (e) {
    console.warn('[MarineAI Emergency Call] Anchor click failed, falling back to location.href:', e);
  }

  // 4. Secondary fallback: direct window.location.href
  try {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  } catch (e) {
    console.error('[MarineAI Emergency Call] Failed to trigger tel scheme:', e);
  }
}
