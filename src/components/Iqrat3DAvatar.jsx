import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const Iqrat3DAvatar = ({ mood = "focused", enableTracking = true }) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isBlinkingRef = useRef(false);
  const rendererRef = useRef(null);
  const reqIdRef = useRef(null);
  
  // Physics State
  const physicsRef = useRef({
    headRotX: 0,
    headRotY: 0,
    antennaLag: { x: 0, y: 0 },
    eyeSaccade: { x: 0, y: 0 } 
  });

  const animParams = useRef({
    bobSpeed: 1.5,
    bobAmp: 0.15,
    shake: 0,
    headTilt: 0,
    armBaseZ: 0.2,      
    armSwingX: 0,       
    armSwingSpeed: 0, 
    elbowBend: 0.3,
    pupilScale: 1.0,
    eyeSquint: 1.0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;
    if (width === 0 || height === 0) return;

    // --- 1. SCENE ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. POST PROCESSING ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.strength = 0.6;
    bloomPass.radius = 0.8;
    bloomPass.threshold = 0.2;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2 - 0.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.2;
    controls.minAzimuthAngle = -0.2;
    controls.maxAzimuthAngle = 0.2;

    // --- 3. MATERIALS ---
    const mainBodyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.15, clearcoat: 1.0, ior: 1.5 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x2c2c35, metalness: 0.6, roughness: 0.7 });
    const screenMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.05 });
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // --- 4. GEOMETRY ---
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Body
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 64).scale(1, 1.15, 1), mainBodyMat);
    bodyMesh.position.y = -1.5;
    bodyMesh.castShadow = true;
    robotGroup.add(bodyMesh);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), darkMetalMat);
    neckMesh.position.y = 0.1;
    robotGroup.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.6;
    robotGroup.add(headGroup);

    // Head
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 64, 64).scale(1.1, 0.9, 1), mainBodyMat);
    headMesh.position.y = 1.0;
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Face Screen
    const screenMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64).scale(1.1, 0.75, 0.5), screenMat);
    screenMesh.position.set(0, 1.0, 0.95);
    headGroup.add(screenMesh);

    // Eyes
    const eyeGeo = new THREE.CapsuleGeometry(0.12, 0.28, 4, 12);
    const pupilGeo = new THREE.CircleGeometry(0.06, 16);

    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.35, 1.2, 1.52);
    headGroup.add(leftEyeGroup);
    const leftEye = new THREE.Mesh(eyeGeo, neonMat);
    leftEye.rotation.set(-0.2, 0, 0.05);
    leftEyeGroup.add(leftEye);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.11);
    leftPupil.rotation.x = -0.2;
    leftEyeGroup.add(leftPupil);

    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.35, 1.2, 1.52);
    headGroup.add(rightEyeGroup);
    const rightEye = new THREE.Mesh(eyeGeo, neonMat);
    rightEye.rotation.set(-0.2, 0, -0.05);
    rightEyeGroup.add(rightEye);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.11);
    rightPupil.rotation.x = -0.2;
    rightEyeGroup.add(rightPupil);

    // Mouth
    let mouthMesh = null;
    const updateMouth = (currentMood) => {
        if (mouthMesh) headGroup.remove(mouthMesh);
        let points = [];
        if (currentMood === 'happy') points = [new THREE.Vector3(-0.15, 0.05, 0), new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0.15, 0.05, 0)];
        else if (currentMood === 'stressed') points = [new THREE.Vector3(-0.15, -0.05, 0), new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(0.15, -0.05, 0)];
        else points = [new THREE.Vector3(-0.10, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.10, 0, 0)];
        
        const curve = new THREE.CatmullRomCurve3(points);
        const mouthGeo = new THREE.TubeGeometry(curve, 12, 0.05, 8, false);
        mouthMesh = new THREE.Mesh(mouthGeo, neonMat);
        mouthMesh.position.set(0, 0.85, 1.53);
        mouthMesh.rotation.x = -0.15;
        headGroup.add(mouthMesh);
    };

    // Antennae
    const antennaLeftGroup = new THREE.Group();
    const antennaRightGroup = new THREE.Group();
    headGroup.add(antennaLeftGroup);
    headGroup.add(antennaRightGroup);

    const createAntenna = (group, xOffset) => {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16), darkMetalMat));
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), new THREE.MeshStandardMaterial({color: 0xbbbbbb, metalness:0.8}));
        stick.position.y = 0.6;
        group.add(stick);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), neonMat);
        bulb.position.y = 1.0;
        group.add(bulb);
        group.position.set(xOffset, 1.8, 0);
        group.rotation.z = xOffset > 0 ? -0.3 : 0.3;
    }
    createAntenna(antennaLeftGroup, -1.1);
    createAntenna(antennaRightGroup, 1.1);

    // Arms
    const arms = { left: { shoulder: null, elbow: null }, right: { shoulder: null, elbow: null } };
    function createArm(isLeft) {
        const xDir = isLeft ? -1 : 1;
        const shoulderGroup = new THREE.Group();
        shoulderGroup.position.set(xDir * 1.55, -0.5, 0); 
        shoulderGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), darkMetalMat));
        
        const upperArmGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.8, 16);
        upperArmGeo.translate(0, -0.4, 0); 
        const upperArm = new THREE.Mesh(upperArmGeo, mainBodyMat);
        upperArm.castShadow = true;
        shoulderGroup.add(upperArm);
        const elbowGroup = new THREE.Group();
        elbowGroup.position.set(0, -0.8, 0);
        upperArm.add(elbowGroup);
        elbowGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), darkMetalMat));
        const forearmGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 16);
        forearmGeo.translate(0, -0.35, 0);
        const forearm = new THREE.Mesh(forearmGeo, mainBodyMat);
        forearm.castShadow = true;
        elbowGroup.add(forearm);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32).scale(1, 1.2, 0.8), mainBodyMat);
        hand.position.y = -0.7;
        forearm.add(hand);
        return { shoulder: shoulderGroup, elbow: elbowGroup, upperArm: upperArm };
    }
    const leftArmObjs = createArm(true);
    const rightArmObjs = createArm(false);
    arms.left = leftArmObjs;
    arms.right = rightArmObjs;
    robotGroup.add(leftArmObjs.shoulder);
    robotGroup.add(rightArmObjs.shoulder);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const mainLight = new THREE.SpotLight(0xffffff, 150);
    mainLight.position.set(-10, 20, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    const rimLight = new THREE.SpotLight(0xddeeff, 120);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0xffeedd, 50);
    fillLight.position.set(10, 5, 10);
    scene.add(fillLight);

    // Logic
    const applyMoodConfig = (m) => {
        updateMouth(m);
        leftEye.rotation.z = 0.05; 
        rightEye.rotation.z = -0.05;
        headGroup.rotation.x = 0; 
        
        let newParams = { 
            bobSpeed: 1.5, bobAmp: 0.15, shake: 0, headTilt: 0,
            armBaseZ: 0.2, armSwingX: 0, armSwingSpeed: 0, elbowBend: 0.3,
            pupilScale: 1.0, eyeSquint: 1.0
        };

        if(m === 'happy') {
            neonMat.color.setHex(0x4ade80);
            newParams = { ...newParams, bobSpeed: 4.0, bobAmp: 0.25, headTilt: 0.15, armBaseZ: 2.5, armSwingX: 0.2, armSwingSpeed: 5.0, elbowBend: 0.5, pupilScale: 1.3, eyeSquint: 0.6 };
        } else if (m === 'improving') {
            neonMat.color.setHex(0x22d3ee);
            newParams = { ...newParams, bobSpeed: 2.5, bobAmp: 0.2, headTilt: -0.05, armBaseZ: 0.25, armSwingX: 0.8, armSwingSpeed: 2.5, elbowBend: 0.5, pupilScale: 1.1, eyeSquint: 0.9 };
        } else if (m === 'stressed') {
            neonMat.color.setHex(0xf87171);
            newParams = { ...newParams, bobSpeed: 15.0, bobAmp: 0.02, shake: 0.05, headTilt: 0.2, armBaseZ: -0.5, elbowBend: 2.2, pupilScale: 0.4, eyeSquint: 1.2 };
        } else if (m === 'lowering') {
            neonMat.color.setHex(0xfbbf24);
            newParams = { ...newParams, bobSpeed: 0.8, bobAmp: 0.1, headTilt: 0.25, pupilScale: 1.0, eyeSquint: 0.7 };
        } else { // focused
            neonMat.color.setHex(0x3b82f6);
            newParams = { ...newParams, bobSpeed: 1.0, bobAmp: 0.05, pupilScale: 0.7 };
        }
        animParams.current = newParams;
    };
    applyMoodConfig(mood);

    const handleMouseMove = (event) => {
        if (!enableTracking) return;
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        mouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Blink & Saccade
    let blinkTimeout, saccadeTimeout;
    const triggerBlink = () => {
        isBlinkingRef.current = true;
        setTimeout(() => {
            isBlinkingRef.current = false;
            blinkTimeout = setTimeout(triggerBlink, 2000 + Math.random() * 4000);
        }, 150);
    };
    blinkTimeout = setTimeout(triggerBlink, 3000);

    const triggerSaccade = () => {
        physicsRef.current.eyeSaccade = { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.05 };
        saccadeTimeout = setTimeout(triggerSaccade, 500 + Math.random() * 2000);
    }
    triggerSaccade();

    const clock = new THREE.Clock();
    const noise = (t) => Math.sin(t) + Math.sin(t * 0.5) * 0.5;

    const animate = () => {
        reqIdRef.current = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const params = animParams.current;
        const phys = physicsRef.current;

        // Bobbing
        let bobY = Math.sin(time * params.bobSpeed) * params.bobAmp;
        if (params.shake > 0) {
            bobY += (Math.random() - 0.5) * params.shake;
            robotGroup.position.x = (Math.random() - 0.5) * params.shake;
        } else {
            robotGroup.position.x = THREE.MathUtils.lerp(robotGroup.position.x, 0, 0.1);
        }
        robotGroup.position.y = bobY - 1.5;

        // Head Tracking
        const { x: rawX, y: rawY } = enableTracking ? mouseRef.current : { x: 0, y: 0 };
        const driftX = noise(time * 0.5) * 0.05;
        const driftY = noise(time * 0.3) * 0.05;
        
        let targetHeadX = (rawY * 0.4) + params.headTilt + driftY;
        let targetHeadY = (rawX * 0.6) + driftX;

        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadX, 0.1);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadY, 0.1);

        // Antennae
        const deltaX = headGroup.rotation.x - phys.headRotX;
        const deltaY = headGroup.rotation.y - phys.headRotY;
        phys.antennaLag.x = THREE.MathUtils.lerp(phys.antennaLag.x, deltaX * 10, 0.1);
        phys.antennaLag.y = THREE.MathUtils.lerp(phys.antennaLag.y, deltaY * 10, 0.1);
        antennaLeftGroup.rotation.x = -phys.antennaLag.x;
        antennaLeftGroup.rotation.z = -phys.antennaLag.y;
        antennaRightGroup.rotation.x = -phys.antennaLag.x;
        antennaRightGroup.rotation.z = -phys.antennaLag.y;
        phys.headRotX = headGroup.rotation.x;
        phys.headRotY = headGroup.rotation.y;

        // Eyes
        const blinkScale = isBlinkingRef.current ? 0.1 : params.eyeSquint;
        leftEye.scale.y = THREE.MathUtils.lerp(leftEye.scale.y, blinkScale, 0.4);
        rightEye.scale.y = THREE.MathUtils.lerp(rightEye.scale.y, blinkScale, 0.4);
        leftPupil.scale.set(params.pupilScale, params.pupilScale, 1);
        rightPupil.scale.set(params.pupilScale, params.pupilScale, 1);
        leftPupil.position.x = THREE.MathUtils.lerp(leftPupil.position.x, phys.eyeSaccade.x, 0.2);
        leftPupil.position.y = THREE.MathUtils.lerp(leftPupil.position.y, phys.eyeSaccade.y, 0.2);
        rightPupil.position.x = THREE.MathUtils.lerp(rightPupil.position.x, phys.eyeSaccade.x, 0.2);
        rightPupil.position.y = THREE.MathUtils.lerp(rightPupil.position.y, phys.eyeSaccade.y, 0.2);

        // Arms
        const swing = Math.sin(time * params.armSwingSpeed) * params.armSwingX;
        arms.left.shoulder.rotation.x = THREE.MathUtils.lerp(arms.left.shoulder.rotation.x, swing, 0.1);
        arms.right.shoulder.rotation.x = THREE.MathUtils.lerp(arms.right.shoulder.rotation.x, -swing, 0.1);
        arms.left.shoulder.rotation.z = THREE.MathUtils.lerp(arms.left.shoulder.rotation.z, -params.armBaseZ, 0.1);
        arms.right.shoulder.rotation.z = THREE.MathUtils.lerp(arms.right.shoulder.rotation.z, params.armBaseZ, 0.1);

        const scale = 1 + Math.sin(time * 2) * 0.005;
        robotGroup.scale.set(scale, scale, scale);

        controls.update();
        composer.render();
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                composer.setSize(width, height);
            }
        }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      clearTimeout(blinkTimeout);
      clearTimeout(saccadeTimeout);
      cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (containerRef.current) {
        while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild);
      }
    };
  }, [mood, enableTracking]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Iqrat3DAvatar;