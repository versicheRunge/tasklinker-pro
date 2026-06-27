// Opens a local/network path via the tasklinker:// custom protocol.
// Requires the one-time Windows installation (tasklinker-install.reg + tasklinker-open.vbs).
export function openLocalPath(path: string) {
  window.location.href = `tasklinker://${encodeURIComponent(path)}`;
}
