import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function FloatingBook({
  position,
  rotation,
  color,
  speed,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  speed: number;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.12;
    group.current.rotation.y = rotation[1] + clock.elapsedTime * 0.12;
  });
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.86, 0.11, 0.62]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[0.82, 0.06, 0.58]} />
        <meshStandardMaterial color="#f3effb" roughness={0.8} />
      </mesh>
      <mesh position={[-0.43, 0, 0]}>
        <boxGeometry args={[0.035, 0.16, 0.64]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function KnowledgeCore() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.08 + pointer.x * 0.16;
    group.current.rotation.x = pointer.y * -0.12;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.78, 2]} />
        <meshPhysicalMaterial
          color="#8d92ec"
          roughness={0.12}
          metalness={0.18}
          transmission={0.2}
          thickness={1.5}
          clearcoat={1}
        />
      </mesh>
      {[0, Math.PI / 3, -Math.PI / 3].map((rotation) => (
        <mesh key={rotation} rotation={[rotation, rotation * 0.45, rotation + 0.4]}>
          <torusGeometry args={[1.28, 0.018, 12, 96]} />
          <meshBasicMaterial
            color={rotation === 0 ? "#d1b7ff" : "#6fe5ff"}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
      <mesh position={[0.96, 0.38, 0.55]}>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshBasicMaterial color="#f3e9ff" />
      </mesh>
      <pointLight color="#aa89ed" intensity={9} distance={4} />
    </group>
  );
}

function CodeTile() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = -1.1 + Math.sin(clock.elapsedTime * 0.75 + 2) * 0.1;
    group.current.rotation.z = -0.12 + Math.sin(clock.elapsedTime * 0.45) * 0.035;
  });
  return (
    <group ref={group} position={[1.55, -1.1, 0.15]} rotation={[0.08, -0.35, -0.12]}>
      <mesh>
        <boxGeometry args={[1.05, 0.68, 0.08]} />
        <meshStandardMaterial color="#181720" roughness={0.24} metalness={0.5} />
      </mesh>
      {[-0.2, 0, 0.2].map((y, index) => (
        <mesh key={y} position={[-0.08 + index * 0.05, y, 0.046]}>
          <boxGeometry args={[0.58 - index * 0.1, 0.035, 0.01]} />
          <meshBasicMaterial color={index === 1 ? "#79dff4" : "#b797f4"} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.22, 0.025);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.16, 0.025);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function LearningUniverse() {
  return (
    <div className="learning-universe" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[3, 4, 5]} color="#f0e8ff" intensity={2.8} />
        <directionalLight position={[-4, -2, 2]} color="#61d8f0" intensity={1.4} />
        <KnowledgeCore />
        <FloatingBook
          position={[-1.65, 1.05, 0.15]}
          rotation={[0.22, 0.35, -0.2]}
          color="#a888e9"
          speed={0.72}
        />
        <FloatingBook
          position={[1.55, 1.25, -0.45]}
          rotation={[-0.25, -0.3, 0.18]}
          color="#6c74d1"
          speed={0.58}
        />
        <FloatingBook
          position={[-1.75, -1.25, -0.25]}
          rotation={[0.1, -0.2, 0.24]}
          color="#5ec3d7"
          speed={0.64}
        />
        <CodeTile />
        <CameraRig />
      </Canvas>
    </div>
  );
}
