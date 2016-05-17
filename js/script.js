window.onload = function()
{
    var camera, scene, renderer;
    var effect, controls;
    var element, container, mercurio;
    var clock = new THREE.Clock();
    var cube, veCubo = false; //VARIABLES DE EJEMPLO, NO DEBERÁ ESTAR AL FINAL...
    //Array de planetas y sus posiciones en el escenario..
    //Posciones elementos...
    /*
    Atrás: x : -300, y : 350, z : 30,
    Adelante : x : 250, y : 350, z : 0
    Izquierda : x : 0, y : 200, z : -350
    Derecha : x : 0, y : 180, z : 300
    */
    //Base array planetas...
    var planetas = [
					 {
             nombre      : "La Luna",
             vista       : false,
             tamano : 33.9,
             imagen 	 : "img/planetas/luna.jpg",
             position    : {x : -300, y : 350, z : 30},
             rotacion: 0.1,
						 objeto		 : 0
					 },
           { nombre  : "Mercurio",
             vista       : false,
             tamano : 33.9,
             imagen	: 'img/planetas/mercurio.jpg',
             position : {x : 250, y : 350, z : 0},
             rotacion: 0.1,
             objeto:0
           },
           { nombre  : "Venus",
             vista       : false,
             tamano : 33.9,
             imagen	: 'img/planetas/venus.jpg',
             position : {x : 0, y : 200, z : -350},
             rotacion: 0.07,
             objeto:0
           },
           { nombre  : "Marte",
             vista   : false,
             tamano : 33.9,
             imagen	: 'img//planetas/marte.jpg',
             position : {x : 0, y : 180, z : 300},
             rotacion: 0.1,
             objeto:0
           }
         ];
    var crearPlaneta = function(data)
	{
		var geometria = new THREE.SphereGeometry(data.tamano,data.tamano,data.tamano);
		var textura = THREE.ImageUtils.loadTexture(data.imagen);
		var material = new THREE.MeshBasicMaterial( { map: textura } );
		return new THREE.Mesh(geometria, material);
	};

    var resize = function()
    {
        var width = container.offsetWidth;
        var height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        effect.setSize(width, height);
    };

    var init = (function()
    {
        renderer = new THREE.WebGLRenderer();
        element = renderer.domElement;
        container = document.getElementById('example');
        container.appendChild(element);
        effect = new THREE.StereoEffect(renderer);
        effect.separation = 0.2;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
        camera.position.set(0, 5, 0);
        scene.add(camera);
        controls = new THREE.OrbitControls(camera, element);
        controls.rotateUp(Math.PI / 4);
        controls.target.set
        (
            camera.position.x + 0.1,
            camera.position.y + 0.1,
            camera.position.z
        );
        controls.noZoom = false;
        controls.noPan = false;
        //controls.autoRotate = true;
        function setOrientationControls(e)
        {
            if (!e.alpha)
            {
                return;
            }
            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();
            element.addEventListener('click', fullscreen, false);
            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
        //Adicona luz..
        window.addEventListener('deviceorientation', setOrientationControls, true);
        var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
        scene.add(light);

        //Crear los panetas...
        //Con la porpiedad position.x se establecerá la posición en x, los mismo con y, z
        //ES ESTE ESPACIO SE ESPERA QUE SE CREEN LOS "PLANTEAS/LUNA"
        // SE PUEDE HACER USO DE LA FUNCIÓN crearPlaneta()
        //EL TAMAÑO DE LOS PLANETAS PUEDE SER IGUAL A 50
        //LAS IMÁGENES SE ENCUENTRA DENTRO DE LA CARPETA img/planteas


        for (var i = 0; i < planetas.length; i++) {
      		planetas[i].objeto =	crearPlaneta({
      											tamano:planetas[i].tamano,
      											imagen:planetas[i].imagen});
          scene.add(planetas[i].objeto);
      		planetas[i].objeto.position.x = planetas[i].position.x;
          planetas[i].objeto.position.y = planetas[i].position.y;
          planetas[i].objeto.position.z = planetas[i].position.z;

      	}

        //http://stemkoski.github.io/Three.js/Skybox.html
        //Para adicionar escenario en 3D...
        var imagePrefix = "img/place/place-";
        var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        var imageSuffix = ".jpg";
        var skyGeometry = new THREE.BoxGeometry( 800, 800, 800 );

        var materialArray = [];
        for (var i = 0; i < 6; i++)
        {
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        }
        var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add( skyBox );
        window.addEventListener('resize', resize, false);
        setTimeout(resize, 1);
    })();

    var update = function(dt)
    {
        resize();
        camera.updateProjectionMatrix();
        controls.update(dt);
    };
    //Saber si el elemento está dentro del punto de vista que se está viendo...
    var puntoDeVista = function()
	{
        var frustum = new THREE.Frustum();
        var cameraViewProjectionMatrix = new THREE.Matrix4();
        camera.updateMatrixWorld(); // make sure the camera matrix is updated
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        frustum.setFromMatrix( cameraViewProjectionMatrix );
        //frustum.intersectsObject(objeto) indica si está el punto de vísta...
        //ESTO LO HARÁ POR CADA FRAME, POR LO QUE ES IMPORTANTE VALIDAR SI YA ESTÁ VIENDO EL OBJETO...
        //EN EL EJEMPLO DEL ARRAY DE PLANETAS, EXISTE LA PROPIEDAD "vista", la cual indica si se está viendo el planeta...
        //EJEMPLO VIENDO UN CUBO...
        for (var i = 0; i < planetas.length; i++) {

          if(frustum.intersectsObject(planetas[i].objeto))
          {
            if(!planetas[i].objeto.vista)
            {
              planetas[i].objeto.vista = true;
              responsiveVoice.speak("Estas viendo "+ planetas[i].nombre, "Spanish Female");
              console.log("Estas viendo "+ planetas[i].nombre);
            }
          }
          else
          {
            planetas[i].objeto.vista = false;
          }
        }
        /*if(frustum.intersectsObject(cube))
        {
            if(!veCubo)
            {
                veCubo = true;
                responsiveVoice.speak("Estas viendo un cubo, es tenporal, por favor borrarlo al final", "Spanish Female");
            }
        }
        else
        {
            veCubo = false;
        }*/
  	};

    var animate = function()
    {

      for (var i = 0; i < planetas.length; i++) {
        planetas[i].objeto.rotation.y += planetas[i].rotacion;
      }
        requestAnimationFrame(animate);
        //ESPACIO DONDE SE ESPERA QUE LOS PLANETAS/LUNA GIREN EN Y
        //SE PUEDE HACER USO DE LA PROPIEDAD rotation
        puntoDeVista();
        update(clock.getDelta());
        effect.render(scene, camera);
    };
    animate();

    var fullscreen = function()
    {
        if (container.requestFullscreen)
        {
            container.requestFullscreen();
        }
        else if (container.msRequestFullscreen)
        {
            container.msRequestFullscreen();
        }
        else if (container.mozRequestFullScreen)
        {
            container.mozRequestFullScreen();
        }
        else if (container.webkitRequestFullscreen)
        {
            container.webkitRequestFullscreen();
        }
    }
};
