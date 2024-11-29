
    const form = document.querySelector('form');
    const resultadoDiv = document.getElementById('resultado');
    const inputImagen = document.getElementById('imagen');
    const loadingImagen = document.getElementById('loading-imagen');
    const loadingEscaneo = document.getElementById('loading-escaneo');
    const previewImagen = document.getElementById('preview-imagen'); 

    //  -----  Drag and Drop  -----
    let dropArea = document.getElementById('drop-area');
    let fileElem = document.getElementById('fileElem');

    // Prevenir el comportamiento por defecto del navegador
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    });

    // Resaltar el área al arrastrar una imagen sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false)
    });

    // Manejar la imagen al soltarla
    dropArea.addEventListener('drop', handleDrop, false);

    function preventDefaults (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    function highlight(e) {
      dropArea.classList.add('highlight')
    }

    function unhighlight(e) {
      dropArea.classList.remove('highlight')
    }

    function handleDrop(e) {
      var dt = e.dataTransfer
      var files = dt.files

      handleFiles(files)
    }

    // Simular clic en el input file al hacer clic en el área
    dropArea.addEventListener('click', (e) => {
      fileElem.click();
    });

    fileElem.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    function handleFiles(files) {
      // Solo procesar la primera imagen si se arrastran varias
      const archivo = files[0]; 
      
      if (archivo) {
        loadingImagen.style.display = 'block'; 
        const reader = new FileReader();

        reader.onload = (e) => {
          previewImagen.src = e.target.result; 
          previewImagen.style.display = 'block'; 
          loadingImagen.style.display = 'none';
          // Asignar el archivo al input original para que se envíe con el formulario
          inputImagen.files = files; 
        }
        reader.readAsDataURL(archivo); 
      } else {
        previewImagen.src = '#'; 
        previewImagen.style.display = 'none'; 
        loadingImagen.style.display = 'none';
      }
    }
    //  -----  Fin Drag and Drop  -----

    inputImagen.addEventListener('change', (event) => {
      loadingImagen.style.display = 'block'; 
      const archivo = event.target.files[0]; 
      const reader = new FileReader();

      reader.onload = (e) => {
        previewImagen.src = e.target.result; 
        previewImagen.style.display = 'block'; 
        loadingImagen.style.display = 'none';
      }

      if (archivo) {
        reader.readAsDataURL(archivo); 
      } else {
        previewImagen.src = '#'; 
        previewImagen.style.display = 'none'; 
        loadingImagen.style.display = 'none';
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      loadingEscaneo.style.display = 'block'; 

      fetch('/', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        resultadoDiv.textContent = data.texto;
        loadingEscaneo.style.display = 'none'; 
      })
      .catch(error => {
        console.error('Error:', error);
        resultadoDiv.textContent = 'Error al escanear la imagen.';
        loadingEscaneo.style.display = 'none';
      });
    });