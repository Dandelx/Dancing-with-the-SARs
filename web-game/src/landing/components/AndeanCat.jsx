import catImage from '../../../images/image.01.png'

/**
 * Loading-screen runner: the static Andean-cat artwork as a transparent PNG.
 * The sprite itself never animates — only the lane position moves, driven by
 * the shared --p progress variable.
 */
export default function AndeanCat() {
  return (
    <img
      className="oj-cat"
      src={catImage}
      alt=""
      draggable="false"
      decoding="async"
    />
  )
}
