'use client'

export default function WidgetError() {
  function close() {
    window.parent.postMessage({ type: 'ohara-close' }, '*')
  }

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-[#fbfaf8] p-6 text-center">
      <button
        type="button"
        onClick={close}
        aria-label="Close chat"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
      >
        ✕
      </button>

      <h1 className="text-lg font-semibold text-neutral-900">Chat unavailable</h1>
      <p className="mt-2 max-w-xs text-sm text-neutral-600">
        This chat isn&apos;t available on this website right now. Please try again later.
      </p>

      <div className="mt-6 max-w-xs rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500">
        <p className="font-medium text-neutral-700">Are you the site owner?</p>
        <p className="mt-1">
          Check that this website&apos;s domain is listed in your allowed origins in the Ohara
          dashboard, including both the <code>www</code> and non-<code>www</code> versions. If it
          still doesn&apos;t work,{' '}
          <a href="mailto:amadijerry823@gmail.com" className="underline" target="_blank" rel="noreferrer">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  )
}