import * as THREE from "three";
import { gsap } from "gsap";

export default class Robot {
    constructor() {
        this.experience = window.experience;
        this.time = this.experience.time;
        this.config = this.experience.config;
        this.scene = this.experience.scene;
        this.gamepad = this.experience.gamepad;
        this.resources = this.experience.resources;
        this.setModel();
    }

    setModel() {
        this.model = {};

        // Add the model
        this.model.group = this.resources.items.robotModel.scene;
        this.scene.add(this.model.group);

        // Parse the differents parts
        this.model.parts = [
            // Button toggle
            {
                type: "buttonToggle",
                regex: /^shoulder/,
                name: "shoulders",
                objects: [],
                speed: 0.002,
                easing: 0.01,
                value: 0,
                easedValue: 0,
                directionMultiplier: 1,
                inputName: "buttonB",
            },
            {
                type: "buttonToggle",
                regex: /^upperArm/,
                name: "upperArms",
                objects: [],
                speed: 0.002,
                easing: 0.01,
                value: 0,
                easedValue: 0,
                directionMultiplier: 1,
                inputName: "buttonX",
            },
            {
                type: "buttonToggle",
                regex: /^elbow/,
                name: "elbows",
                objects: [],
                speed: 0.002,
                easing: 0.01,
                value: 0,
                easedValue: 0,
                directionMultiplier: 1,
                inputName: "buttonA",
            },
            {
                type: "buttonToggle",
                regex: /^forearm/,
                name: "forearms",
                objects: [],
                speed: 0.002,
                easing: 0.01,
                value: 0,
                easedValue: 0,
                directionMultiplier: 1,
                inputName: "buttonY",
            },
            // Button pressure
            {
                type: "buttonPressure",
                regex: /^clamp/,
                name: "clamps",
                objects: [],
                easing: 0.01,
                value: 0,
                easedValue: 0,
                inputName: "buttonRT",
            },
            // Joystick
            {
                type: "joystick",
                regex: /^torso/,
                name: "torsos",
                objects: [],
                easing: 0.002,
                x: 0,
                easedX: 0,
                y: 0,
                easedY: 0,
                value: 0,
                easedValue: 0,
                inputName: "joystickLeft",
            },
        ];

        this.model.group.traverse((_child) => {
            if (_child instanceof THREE.Object3D) {
                const part = this.model.parts.find((_part) =>
                    _child.name.match(_part.regex)
                );

                if (part) {
                    part.objects.push(_child);
                }
            }
        });

        for (const _part of this.model.parts) {
            // Save as property
            this.model[_part.name] = _part;

            if (_part.type === "buttonToggle") {
                // Input pressed event
                this.gamepad.inputs[_part.inputName].on("pressed", () => {
                    _part.directionMultiplier *= -1;
                });
            }
        }
    }

    update() {
        /**
         * Parts
         */

        for (const _part of this.model.parts) {
            /**
             * Update values
             */
            if (_part.type === "buttonToggle") {
                if (this.gamepad.inputs[_part.inputName].pressed) {
                    _part.value +=
                        _part.speed *
                        this.time.delta *
                        _part.directionMultiplier;
                }
            } else if (_part.type === "buttonPressure") {
                _part.value = this.gamepad.inputs[_part.inputName].pressure;
            } else if (_part.type === "joystick") {
                _part.x = this.gamepad.inputs[_part.inputName].x;
                _part.y = this.gamepad.inputs[_part.inputName].y;
            }

            /**
             * Apply easing and update objects
             */
            if (
                _part.type === "buttonToggle" ||
                _part.type === "buttonPressure"
            ) {
                _part.easedValue +=
                    (_part.value - _part.easedValue) *
                    _part.easing *
                    this.time.delta;

                for (const _object of _part.objects) {
                    _object.rotation[_object.userData.axis] =
                        _part.value * _object.userData.multiplier;
                }
            } else if (_part.type === "joystick") {
                _part.easedX +=
                    (_part.x - _part.easedX) * _part.easing * this.time.delta;
                _part.easedY +=
                    (_part.y - _part.easedY) * _part.easing * this.time.delta;

                // Update objects
                for (const _object of _part.objects) {
                    _object.rotation.y =
                        _part.easedX * _object.userData.multiplier;
                    _object.rotation.x =
                        _part.easedY * _object.userData.multiplier;
                }
            }
        }
        // console.log(this.gamepad.inputs.buttonRT.pressure);
    }
}
