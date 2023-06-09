import Vector from "../math/vector";
import { GroupNode } from "../nodes";
import { Rotation, SQT, Translation } from "../math/transformation";
import Quaternion from "../math/quaternion";
import { rotate, scale, translate } from "../boilerplate/project-boilerplate";

/**
 * Class representing an Animation
 */
export class AnimationNode {
  /**
   * Describes if the animation is running
   */
  active: boolean;

  /**
   * Creates a new AnimationNode
   * @param groupNode The GroupNode to attach to
   */
  constructor(public groupNode: GroupNode) {
    this.active = false;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class RotationNode extends AnimationNode {
  /**
   * The absolute angle of the rotation
   */
  angle: number;
  /**
   * The vector to rotate around
   */
  axis: Vector;
  speed: number;

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   */
  constructor(groupNode: GroupNode, axis: Vector, speed?: number) {
    super(groupNode);
    this.angle = Math.PI * 4;
    this.axis = axis;
    if (speed) {
      this.speed = speed;
    } else {
      this.speed = 0.0001;
    }
  }
  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      rotate(this.axis, this.speed * this.angle * deltaT, this.groupNode);
    }
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class SlerpNode extends AnimationNode {
  /**
   * The time
   */
  t: number;

  /**
   * The rotations to interpolate between
   */
  rotations: [Quaternion, Quaternion];

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   */
  constructor(groupNode: GroupNode, rotation1: Quaternion, rotation2: Quaternion) {
    super(groupNode);
    this.rotations = [rotation1, rotation2];
    this.t = 0;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      this.t += 0.001 * deltaT;
      const rot = this.rotations[0].slerp(this.rotations[1], (Math.sin(this.t) + 1) / 2);
      (this.groupNode.transform as SQT).rotation = rot;
    }
  }
}
/**
 * Class representing a Jumping Animation
 * @extends AnimationNode
 */
export class JumperNode extends AnimationNode {
  distanceToGoal: number; //wie weit soll er springen
  speed: number; //wie schnell soll er springen?
  direction: Vector;
  up: boolean = true;
  distanceCovered: number = 0;
  single: boolean = false;

  constructor(groupNode: GroupNode, direction: Vector, speed?: number, single?: boolean) {
    super(groupNode);
    this.distanceToGoal = direction.length;
    this.direction = direction;
    if (speed) {
      this.speed = speed;
    } else {
      this.speed = 0.001;
    }
    if (single) {
      this.single = single;
    } else {
      this.single = false;
    }
  }

  simulate(deltaT: number) {
    if (this.active) {
      if (this.up) {
        //wenn up true ist, wird die translate methode ausgeführt, aber für speed * deltaT
        //und distanceCovered wird immer erhöht, um zu schauen wann man im Ziel ist
        translate(this.direction.mul(this.speed * deltaT), this.groupNode);
        this.distanceCovered += this.direction.mul(this.speed).length * deltaT;
        if (this.distanceCovered >= this.distanceToGoal) {
          this.up = false;
        }
      } else {
        //wenn up false ist, wird die translate methode ausgeführt, aber für -1 * speed * deltaT, um rückwärts zu laufen
        translate(this.direction.mul(-1 * this.speed * deltaT), this.groupNode);
        this.distanceCovered -= this.direction.mul(this.speed).length * deltaT;
        if (this.distanceCovered <= 0) {
          if (this.single) {
            this.active = false;
          }
          this.up = true;
        }
      }
    }
  }
}

export class ScalerNode extends AnimationNode {
  distanceToGoal: number; //Wie weit muss er insgesamt skalieren?
  scaling: Vector; //Ziel skalierung
  firstHalf: boolean = true; //aktiv in welche richtung es geht
  distanceCovered: number = 0; //wie viel von der Skalierung hat er schon geschaff
  speed: number; //wie schnell skalieren
  single: boolean = false;

  constructor(groupNode: GroupNode, scaling: Vector, single?: boolean, speed?: number) {
    super(groupNode);
    this.scaling = scaling.sub(new Vector(1, 1, 1, 0));
    this.distanceToGoal = this.scaling.length;
    if (speed) {
      this.speed = speed;
    } else {
      this.speed = 0.001;
    }
    if (single) {
      this.single = single;
    } else {
      this.single = false;
    }
  }

  simulate(deltaT: number) {
    if (this.active) {
      if (this.firstHalf) {
        //   wenn firsthalf true ist, wird die scale methode ausgeführt, aber für speed * deltaT
        //   und distanceCovered wird immer erhöht, um zu schauen wann man im Ziel ist
        scale(new Vector(1, 1, 1, 0).add(this.scaling.mul(this.speed).mul(deltaT)), this.groupNode);
        this.distanceCovered += this.scaling.length * deltaT * this.speed;
        if (this.distanceCovered >= this.distanceToGoal) {
          //not needed?
          if (this.single) {
            this.active = false;
          }
          this.firstHalf = false;
        }
      } else {
        //wenn fistHalf false ist, wird die scale methode ausgeführt, aber für -1 * speed * deltaT, um rückwärts zu laufen
        scale(new Vector(1, 1, 1, 0).sub(this.scaling.mul(this.speed).mul(deltaT)), this.groupNode);
        this.distanceCovered -= this.scaling.length * deltaT * this.speed;
        if (this.distanceCovered <= 0) {
          this.firstHalf = true;
        }
      }
    }
  }
}

export class DriverNode extends AnimationNode {
  distanceToGoal: number; //wie weit soll er springen
  speed: number; //wie schnell soll er springen?
  direction: Vector;
  up: boolean = true;
  distanceCovered: number = 0;

  constructor(groupNode: GroupNode, direction: Vector, speed?: number) {
    super(groupNode);
    this.distanceToGoal = direction.length;
    this.direction = direction;
    if (speed) {
      this.speed = speed;
    } else {
      this.speed = 0.001;
    }
  }

  simulate(deltaT: number) {
    if (this.active) {
      //wenn active true ist, wird die translate methode ausgeführt, aber für speed * deltaT
      //und distanceCovered wird immer erhöht, um zu schauen wann man im Ziel ist
      translate(this.direction.mul(this.speed * deltaT), this.groupNode);
      this.distanceCovered += this.direction.mul(this.speed).length * deltaT;
      if (this.distanceCovered >= this.distanceToGoal) {
        this.active = false;
      }
    }
  }
}
