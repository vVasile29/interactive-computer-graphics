import Vector from "../math/vector";
import Ray from "src/math/ray";
import Intersection from "src/math/intersection";
import Plane from "../math/plane";

/**
 * Class representing an axis aligned box
 */
export default class AABox {
  /**
   * The box's vertices
   */
  vertices: Array<Vector>;
  /**
   * The indices of the vertices that
   * together form the faces of the box
   */
  indices: Array<number>;

  /**
   * Creates an axis aligned box
   * @param minPoint The minimum Point
   * @param maxPoint The maximum Point
   * @param color The colour of the cube
   */
  constructor(minPoint: Vector, maxPoint: Vector, public color: Vector) {
    /*
      7----6
     /|   /|   2 = maxPoint
    3----2 |   4 = minPoint
    | 4--|-5   Looking into negative z direction
    |/   |/
    0----1
     */

    this.color = color;
    this.vertices = [
      new Vector(minPoint.x, minPoint.y, maxPoint.z, 1),
      new Vector(maxPoint.x, minPoint.y, maxPoint.z, 1),
      new Vector(maxPoint.x, maxPoint.y, maxPoint.z, 1),
      new Vector(minPoint.x, maxPoint.y, maxPoint.z, 1),
      new Vector(minPoint.x, minPoint.y, minPoint.z, 1),
      new Vector(maxPoint.x, minPoint.y, minPoint.z, 1),
      new Vector(maxPoint.x, maxPoint.y, minPoint.z, 1),
      new Vector(minPoint.x, maxPoint.y, minPoint.z, 1),
    ];
    this.indices = [
      0,
      1,
      2,
      0,
      2,
      3, //front
      1,
      5,
      6,
      1,
      6,
      2, //right
      5,
      4,
      7,
      5,
      7,
      6, //back
      4,
      0,
      3,
      4,
      3,
      7, //left
      3,
      2,
      6,
      3,
      6,
      7, //top
      4,
      5,
      1,
      4,
      1,
      0, //bottom
    ];
  }

  /**
   * Calculates the intersection of the AAbox with the given ray
   * @param ray The ray to intersect with
   * @return The intersection if there is one, null if there is none
   */
  intersect(ray: Ray): Intersection | null {
    let intersectionMin = null;
    let intersectionTMin = Infinity;
    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.vertices[this.indices[i]];
      const b = this.vertices[this.indices[i + 1]];
      const c = this.vertices[this.indices[i + 2]];

      //create a plane from the 3 vertices of the box
      const plane = new Plane(a, b, c);
      //calculate the intersection of the ray with the plane
      const intersection = plane.intersect(ray);

      const vertices = [a, b, c];
      // if the intersection is not null and is inside the box, return it
      if (intersection && plane.isInside(vertices, intersection.point) && intersection.t < intersectionTMin) {
        intersectionMin = intersection;
        intersectionTMin = intersection.t;
      }
    }
    return intersectionMin;
  }
}
