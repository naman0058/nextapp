export function PrivacyNotice() {
  return (
    <div className="space-y-2 text-xs leading-relaxed text-muted">
      <p>
        Local preflight checks on captions and alt-text heuristics run in your
        browser and are not sent to our server.
      </p>
      <p>
        Optional AI image analysis is separate and only runs when you choose
        &quot;Analyze Image with AI.&quot;
      </p>
    </div>
  );
}
