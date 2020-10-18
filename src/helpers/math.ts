import { Point } from "../typings";

/**
 * Calculate the distance between 2 points
 *
 * @param x1 first point x
 * @param y1 first point y
 * @param x2 second point x
 * @param y2 second point y
 * @returns the calculated distance
 */
export function getDistanceBetweenTwoPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the center point between 2 points
 *
 * @param x1 first point x
 * @param y1 first point y
 * @param x2 second point x
 * @param y2 second point y
 * @returns the center point
 */
export function getCenterPointBetweenTwoPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Point {
  return {
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2,
  };
}
