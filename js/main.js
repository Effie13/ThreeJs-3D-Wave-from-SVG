// Main
	!(function main() {
		const canvas = document.getElementById('wave');
		
		const renderer = new THREE.WebGLRenderer({canvas , antialias: true, powerPreference: "high-performance", alpha: true });
		var hero = document.querySelector('.hero-bg.inner'), width = hero.offsetWidth , height = hero.offsetHeight , fov = 1000; // Field of view
		renderer.setSize(width, height);
		const camera = new THREE.PerspectiveCamera( fov , width / height , 0.1 , 5000); // fov, aspect, near, far
		camera.position.set( 0,0, -550);

		const scene = new THREE.Scene();

		//scene.fog = new THREE.Fog( 0xf88032, -100, 500);
		scene.add(camera);
		
		// Light
		
		{
			const color = 0xbbbbbb;
			const intensity = 1.1;
			const light = new THREE.PointLight(color, intensity);
			light.position.set(-800, -30, -500);
			scene.add(light);
		}
		
		// Orbit Controls
		var angle = Math.PI * 0.5;
		const controls = new OrbitControls(camera,canvas);
		controls.maxDistance = 900;
		controls.minDistance = 0;
		controls.maxAzimuthAngle = Math.PI * 2;
		controls.minAzimuthAngle = Math.PI;
		controls.maxPolarAngle = Math.PI;
		controls.minPolarAngle = 0;
			
		controls.target.set(0, 0, 0);
		controls.rotateSpeed = 0.2;
		controls.zoomSpeed = 0.6;
		controls.enableDamping = true;
		
		controls.update();	

		// Helper Functions 
		var axesHelper = new THREE.AxesHelper( 10 );
		scene.add( axesHelper );
		
		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
		})();

		function resizeRendererToDisplaySize(renderer) {
			const canvas = renderer.domElement;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			const needResize = canvas.width !== width || canvas.height !== height;
			if (needResize) {
			  renderer.setSize(width, height, false);
			}
			return needResize;
		}
		
		// Render
		
		let renderRequested = false;
		
		function render(time){
			renderRequested = undefined;
			
			//time *= 0.001;  // convert to seconds

			
			if (resizeRendererToDisplaySize(renderer)) {
				const canvas = renderer.domElement;
				camera.aspect = canvas.clientWidth / canvas.clientHeight;
				camera.updateProjectionMatrix();
			}
			/*for ( var i = 0; i <= zIndexArray.length; i += 2){
				console.log(zIndexArray[i]);
			}*/
			controls.update();
			renderer.render(scene, camera);
		}
		
		function requestRenderIfNotRequested() {
		  if (!renderRequested) {
			renderRequested = true;
			requestAnimFrame(render);
		  }
		}
		
		controls.addEventListener('change', requestRenderIfNotRequested);
		window.addEventListener('resize', requestRenderIfNotRequested);
		
		var zIndexArray = [];
		
		var initWave = function(data){
			var paths = data.paths, group = new THREE.Group();
				var material = new THREE.MeshLambertMaterial( {
					color: 0x943e12,
					//side: THREE.BackSide, 
					//flatShading: false,
					emissive: 0xa93a06
				} );
				var geometry = new THREE.CircleBufferGeometry( 2, 12 , 12);
				
        var layerMesh, path, shape;
				for ( var i = 0; i < paths.length; i++ ) {
					layerMesh = new THREE.Group();
					path = paths[ i ];
					let layer = [];
					for ( var j = 0 ; j < path.subPaths.length; j++ ){
						
						shape = path.subPaths[j];
						var mesh = new THREE.Mesh(geometry, material);
						mesh.position.set(shape.currentPoint.x, shape.currentPoint.y, i );
						
						layerMesh.add(mesh);
						layer.push(mesh);
					}
					group.add(layerMesh);
					zIndexArray.push(layer);
				}
				
				//console.log( 'Layers: ' + zIndexArray.length);
				
				new THREE.Box3().setFromObject( group ).getCenter( group.position ).multiplyScalar( - 1 );
				group.position.z = 100;
				camera.lookAt(0,0,0);
				camera.up = new THREE.Vector3(0, 1, 0);
				console.log(group);

				// Helper to draw groups bounding box
				var helper = new THREE.BoxHelper(group, 0xffffff);
				helper.update();
				scene.add(helper);
				
				//console.log(scene);
				render();
				canvas.classList.add('fadeIn');
				//requestAnimFrame(render);
		}
		
		var manager = new SVGLoader();
			
		manager.load( './assets/particle-shape.svg', initWave,
		function(xhr){
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		function(err){
			console.log('An error occured: ' + err.message);
		});
	
	})();
