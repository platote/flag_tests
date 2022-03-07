import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useScene, useFrame} = metaversefile;

export default e => {
  const app = useApp();
  const scene = useScene();
  const geometry = new THREE.PlaneGeometry(1,1,32,32);
  const count = geometry.attributes.position.count;
  const randoms = new Float32Array(count);

  for (let i = 0; i < count; i++){
    randoms[i] = Math.random();
  }

  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      ${THREE.ShaderChunk.common}
      uniform vec2 uFrequency;
      uniform float uTime;

      ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
      void main()
      {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
        modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;
        ${THREE.ShaderChunk.logdepthbuf_vertex}
      }
    `,
    fragmentShader: `
      ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
      uniform vec3 uColor;

      void main()
      {
        gl_FragColor = vec4(uColor, 1.0);
        ${THREE.ShaderChunk.logdepthbuf_fragment}
      }
    `,
    uniforms:
    {
      uFrequency : { value : new THREE.Vector2(10,5)},
      uTime : {value : 0},
      uColor : {value : new THREE.Color('orange')}
    },
    side : THREE.DoubleSide
  }); 

  const plane = new THREE.Mesh(geometry,material);

  plane.position.set(0,2,0);
  scene.add(plane);
  scene.updateMatrixWorld();

  const clock = new THREE.Clock();

  useFrame(({timestamp, timeDiff})=> {
    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;
  });

  return app;
};
