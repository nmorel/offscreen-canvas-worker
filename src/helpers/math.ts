import {
  Matrix,
  Point,
  OriginX,
  OriginY,
  ObjectGeometry,
  CornerPoints,
  Bounds,
} from "../typings";

const PiBy180 = Math.PI / 180,
  PiBy2 = Math.PI / 2,
  originXOffset = {
    left: -0.5,
    center: 0,
    right: 0.5,
  },
  originYOffset = {
    top: -0.5,
    center: 0,
    bottom: 0.5,
  };

function getIdentityMatrix(): Matrix {
  return [1, 0, 0, 1, 0, 0];
}

/**
 * Transforms degrees to radians.
 * @param degrees value in degrees
 * @return value in radians
 */
export function degreesToRadians(degrees: number) {
  return degrees * PiBy180;
}

/**
 * Calculate the cos of an angle, avoiding returning floats for known results
 * @param angle the angle in radians or in degree
 * @return the cos of an angle
 */
function calcCos(angle: number) {
  if (angle === 0) {
    return 1;
  }
  if (angle < 0) {
    // cos(a) = cos(-a)
    angle = -angle;
  }
  const angleSlice = angle / PiBy2;
  switch (angleSlice) {
    case 1:
    case 3:
      return 0;
    case 2:
      return -1;
    default:
      break;
  }
  return Math.cos(angle);
}

/**
 * Calculate the sin of an angle, avoiding returning floats for known results
 * @param angle the angle in radians or in degree
 * @return the sin of an angle
 */
function calcSin(angle: number) {
  if (angle === 0) {
    return 0;
  }
  const angleSlice = angle / PiBy2;
  let sign = 1;
  if (angle < 0) {
    // sin(-a) = -sin(a)
    sign = -1;
  }
  switch (angleSlice) {
    case 1:
      return sign;
    case 2:
      return 0;
    case 3:
      return -sign;
    default:
      break;
  }
  return Math.sin(angle);
}

/**
 * Rotates `vector` with `radians`
 * @param vector The vector to rotate (x and y)
 * @param radians The radians of the angle for the rotation
 * @return The new rotated point
 */
function rotateVector(vector: Point, radians: number) {
  const sin = calcSin(radians),
    cos = calcCos(radians),
    rx = vector.x * cos - vector.y * sin,
    ry = vector.x * sin + vector.y * cos;
  return {
    x: rx,
    y: ry,
  };
}

/**
 * Rotates `point` around `origin` with `radians`
 * @param point The point to rotate
 * @param origin The origin of the rotation
 * @param radians The radians of the angle for the rotation
 * @return The new rotated point
 */
export function rotatePoint(
  point: Point,
  origin: Point,
  radians: number
): Point {
  const v = rotateVector(
    {
      x: point.x - origin.x,
      y: point.y - origin.y,
    },
    radians
  );
  return {
    x: v.x + origin.x,
    y: v.y + origin.y,
  };
}

/**
 * Apply transform t to point p
 * @param  p The point to transform
 * @param  t The transform
 * @param  ignoreOffset Indicates that the offset should not be applied
 * @return The transformed point
 */
export function transformPoint(
  p: Point,
  t: number[],
  ignoreOffset: boolean = false
): Point {
  if (ignoreOffset) {
    return {
      x: t[0] * p.x + t[2] * p.y,
      y: t[1] * p.x + t[3] * p.y,
    };
  }
  return {
    x: t[0] * p.x + t[2] * p.y + t[4],
    y: t[1] * p.x + t[3] * p.y + t[5],
  };
}

/**
 * Returns coordinates of points's bounding rectangle (left, top, width, height)
 * @param points 4 points array
 * @return Object with left, top, width, height properties
 */
export function makeBoundingBoxFromPoints(points: CornerPoints) {
  const xPoints = [points.tl.x, points.tr.x, points.br.x, points.bl.x],
    minX = Math.min(...xPoints),
    maxX = Math.max(...xPoints),
    width = maxX - minX,
    yPoints = [points.tl.y, points.tr.y, points.br.y, points.bl.y],
    minY = Math.min(...yPoints),
    maxY = Math.max(...yPoints),
    height = maxY - minY;

  return {
    left: minX,
    top: minY,
    width,
    height,
  };
}

/**
 * Calculate the object's corner's position after applying its own transformations.
 * @param object the object
 * @param objectTransform override the object's tranformation
 * @returns the corners position
 */
export function calcCornerPoints(object: ObjectGeometry) {
  const dimensions = getNonTransformedDimensions(object);

  const dimX = dimensions.width / 2;
  const dimY = dimensions.height / 2;
  const points: CornerPoints = {
    tl: {
      x: -dimX,
      y: -dimY,
    },
    tr: {
      x: dimX,
      y: -dimY,
    },
    bl: {
      x: -dimX,
      y: dimY,
    },
    br: {
      x: dimX,
      y: dimY,
    },
  };
  const transformMatrix = calcTransformMatrix(
    object.scale.scaleX,
    object.scale.scaleY,
    object.skew.skewX,
    object.skew.skewY
  );
  (Object.keys(points) as Array<keyof CornerPoints>).forEach((key) => {
    points[key] = transformPoint(points[key], transformMatrix);
  });
  return points;
}

/**
 * Calculate object bounding dimensions from its properties scale, skew.
 * @param object the object
 * @param objectTransform override the object's tranformation
 * @returns the dimensions
 */
export function calcTransformedDimensions(object: ObjectGeometry) {
  return makeBoundingBoxFromPoints(calcCornerPoints(object));
}

/**
 * Given a point of an object it calculates the coordinates of an objects' other origin point on the bounding box
 * Very useful when a rectangle is skewed and its coordinates diverge from its bounding box
 * @param object the object
 * @param point coordinates of the object fromOrigin point
 * @param fromOriginX object's X origin corresponding to the point X value
 * @param fromOriginY object's Y origin corresponding to the point X value
 * @param toOriginX object box's wanted X origin
 * @param toOriginY object box's wanted Y origin Y origin
 * @returns the dimensions
 */
export function translateToBoundingBoxGivenOrigin(
  object: ObjectGeometry,
  point: Point,
  fromOriginX: OriginX,
  fromOriginY: OriginY,
  toOriginX: OriginX,
  toOriginY: OriginY
): Point {
  const offsetX = originXOffset[toOriginX] - originXOffset[fromOriginX];
  const offsetY = originYOffset[toOriginY] - originYOffset[fromOriginY];

  let x = point.x,
    y = point.y;

  if (offsetX || offsetY) {
    const dim = calcTransformedDimensions(object);
    x = point.x + offsetX * dim.width;
    y = point.y + offsetY * dim.height;
  }
  return { x, y };
}

/**
 * Given a bounding box origin point it translates it to the center point
 * @param object object
 * @param point object point
 * @param originX Horizontal origin
 * @param originY Vertical origin
 * @return Coordinates at given selection origin
 */
function translateToBoundingBoxCenterPoint(
  object: ObjectGeometry,
  point: Point,
  originX: OriginX,
  originY: OriginY
) {
  const p = translateToBoundingBoxGivenOrigin(
    object,
    point,
    originX,
    originY,
    OriginX.center,
    OriginY.center
  );
  if (object.angle) {
    return rotatePoint(p, point, degreesToRadians(object.angle));
  }
  return p;
}

/**
 * Returns the real center coordinates of the object
 * @param object the object
 * @return the center point
 */
function getCenterPoint(object: ObjectGeometry) {
  return translateToBoundingBoxCenterPoint(
    object,
    { x: object.coords.left, y: object.coords.top },
    object.originX,
    object.originY
  );
}

/**
 * Calculate rotation matrix of an object
 * @param object the object
 * @return rotation matrix for the object
 */
function calcRotateMatrix({ angle }: { angle: number }): Matrix {
  if (angle % 360) {
    const theta = degreesToRadians(angle),
      cos = calcCos(theta),
      sin = calcSin(theta);
    return [cos, sin, -sin, cos, 0, 0];
  }
  return getIdentityMatrix();
}

/**
 * Calculate the translation matrix for an object transform
 * @param object the object
 * @return rotation matrix for the object
 */
function calcTranslateMatrix(object: ObjectGeometry): Matrix {
  const center = getCenterPoint(object);
  return [1, 0, 0, 1, center.x, center.y];
}

/**
 * Multiply matrix A by matrix B to nest transformations
 * @param   a First transformMatrix
 * @param   b Second transformMatrix
 * @param   is2x2 flag to multiply matrices as 2x2 matrices
 * @return  The product of the two transform matrices
 */
function multiplyTransformMatrices(
  a: number[],
  b: number[],
  is2x2: boolean = false
): Matrix {
  // Matrix multiply a * b
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
    is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

export function calcTransformMatrix(
  scaleX: number,
  scaleY: number,
  skewX: number = 0,
  skewY: number = 0
) {
  let skewMatrix: [number, number, number, number],
    scaleMatrix: Matrix = [scaleX, 0, 0, scaleY, 0, 0];
  if (skewX) {
    skewMatrix = [1, 0, Math.tan(degreesToRadians(skewX)), 1];
    scaleMatrix = multiplyTransformMatrices(scaleMatrix, skewMatrix, true);
  }
  if (skewY) {
    skewMatrix = [1, Math.tan(degreesToRadians(skewY)), 0, 1];
    scaleMatrix = multiplyTransformMatrices(scaleMatrix, skewMatrix, true);
  }
  return scaleMatrix;
}

/**
 * Calculate object dimensions from its properties
 * @param object the object
 * @returns dimensions
 */
function getNonTransformedDimensions(object: ObjectGeometry) {
  const strokeWidth = object.strokeWidth,
    width = object.width + strokeWidth,
    height = object.height + strokeWidth;
  return { width, height };
}

/**
 * Calculates the displayed coords of the object's corner points
 *
 * @param object Object
 * @returns corner points
 */
function calcDisplayedCornerPoints(
  object: ObjectGeometry,
  relativeMatrix: Matrix
) {
  const dimensions = getNonTransformedDimensions(object);
  const w = dimensions.width / 2;
  const h = dimensions.height / 2;
  return {
    tl: transformPoint({ x: -w, y: -h }, relativeMatrix),
    tr: transformPoint({ x: w, y: -h }, relativeMatrix),
    bl: transformPoint({ x: -w, y: h }, relativeMatrix),
    br: transformPoint({ x: w, y: h }, relativeMatrix),
  };
}

function calcBounds({ tl, tr, br, bl }: CornerPoints) {
  const minX = Math.min(tl.x, tr.x, br.x, bl.x);
  const maxX = Math.max(tl.x, tr.x, br.x, bl.x);
  const minY = Math.min(tl.y, tr.y, br.y, bl.y);
  const maxY = Math.max(tl.y, tr.y, br.y, bl.y);
  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates the object's displayed matrix
 * Its origin is the top left corner of the shape
 *
 * @param object Object
 * @returns the bounds
 */
export function calcDisplayedMatrixAndBounds(
  object: ObjectGeometry
): { matrix: Matrix; bounds: Bounds } {
  const transformMatrix = calcTransformMatrix(
    object.scale.scaleX,
    object.scale.scaleY,
    object.skew.skewX,
    object.skew.skewY
  );
  const positionMatrix = multiplyTransformMatrices(
    calcTranslateMatrix(object),
    calcRotateMatrix(object)
  );
  const relativeMatrix = multiplyTransformMatrices(
    positionMatrix,
    transformMatrix
  );

  const cornerPoints = calcDisplayedCornerPoints(object, relativeMatrix);

  return {
    matrix: [
      relativeMatrix[0],
      relativeMatrix[1],
      relativeMatrix[2],
      relativeMatrix[3],
      cornerPoints.tl.x,
      cornerPoints.tl.y,
    ],
    bounds: calcBounds(cornerPoints),
  };
}

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
