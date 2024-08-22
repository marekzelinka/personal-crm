import { cx } from '~/utils/misc'

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="currentColor"
      className={cx('text-primary', className)}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M100 0C72.3858 0 50 22.3858 50 50C22.3858 50 2.18557e-06 72.3858 0 100C0 127.614 22.3858 150 50 150C50 177.614 72.3858 200 100 200C127.614 200 150 177.614 150 150C177.614 150 200 127.614 200 100C200 72.3858 177.614 50 150 50C150 22.3858 127.614 0 100 0ZM140.306 59.6939C140.306 37.4334 122.26 19.3878 100 19.3878C77.7395 19.3878 59.6939 37.4334 59.6939 59.6939C37.4334 59.6939 19.3878 77.7395 19.3878 100C19.3878 122.26 37.4334 140.306 59.6939 140.306C59.6939 162.567 77.7395 180.612 100 180.612C122.26 180.612 140.306 162.567 140.306 140.306C162.567 140.306 180.612 122.26 180.612 100C180.612 77.7395 162.567 59.6939 140.306 59.6939ZM69.3878 69.3878C69.3878 52.4811 83.0933 38.7755 100 38.7755C116.907 38.7755 130.612 52.4811 130.612 69.3878C147.519 69.3878 161.224 83.0933 161.224 100C161.224 116.907 147.519 130.612 130.612 130.612C130.612 147.519 116.907 161.224 100 161.224C83.0933 161.224 69.3878 147.519 69.3878 130.612C52.4811 130.612 38.7755 116.907 38.7755 100C38.7755 83.0933 52.4811 69.3877 69.3878 69.3878Z"
      />
    </svg>
  )
}
