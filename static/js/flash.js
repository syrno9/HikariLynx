function fetchAndUpdateHTML(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('postNumber');

      threads.forEach((thread, index) => {
        const threadLink = document.createElement('a');
        threadLink.href = `/f/res/${thread.threadId}.html`; 
        threadLink.textContent = thread.threadId;
        threadLink.target = "";

        const paragraphElement = document.createElement('p');
        paragraphElement.appendChild(threadLink);
        listElement.appendChild(paragraphElement);

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateHTML(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateHTML(1);

function fetchAndUpdateNames(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('postName');

      threads.forEach((thread, index) => {
        const paragraphElement = document.createElement('p');
        paragraphElement.textContent = thread.name;
        listElement.appendChild(paragraphElement);

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateNames(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateNames(1);

function fetchAndUpdateFiles(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const listElement = document.getElementById('fileName');
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));

      threads.forEach((thread, index) => {
        thread.files.forEach((file, fileIndex) => {
          const truncatedName = file.originalName.length > 20 ? file.originalName.slice(0, 20) + '...' : file.originalName;

          const fileLink = document.createElement('a');
          fileLink.href = file.path; 
          fileLink.textContent = truncatedName;
          fileLink.target = "_blank";

          const paragraphElement = document.createElement('p');
          paragraphElement.appendChild(fileLink);
          listElement.appendChild(paragraphElement);

          if (index !== threads.length - 1 || fileIndex !== thread.files.length - 1) {
            const hrElement = document.createElement('hr');
            listElement.appendChild(hrElement);
          }
        });
      });

      if (data.pageCount > pageNumber) {
        const hrElement = document.createElement('hr');
        listElement.appendChild(hrElement);
        fetchAndUpdateFiles(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateFiles(1);

function fetchAndUpdateSubjects(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('postSubject');

      threads.forEach((thread, index) => {
        const truncatedSubject = thread.subject ? (thread.subject.length > 20 ? thread.subject.slice(0, 20) + '...' : thread.subject) : 'No Subject';

        const subjectElement = document.createElement('p');
        subjectElement.innerHTML = `<span class="labelSubject">${truncatedSubject}</span>`;
        listElement.appendChild(subjectElement);

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateSubjects(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateSubjects(1);

function fetchAndUpdateFileSizes(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const listElement = document.getElementById('fileSize');
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));

      threads.forEach((thread, index) => {
        thread.files.forEach((file, fileIndex) => {
          const fileSizeElement = document.createElement('p');
          fileSizeElement.textContent = formatFileSize(file.size);
          listElement.appendChild(fileSizeElement);

          if (index !== threads.length - 1 || fileIndex !== thread.files.length - 1) {
            const hrElement = document.createElement('hr');
            listElement.appendChild(hrElement);
          }
        });
      });

      if (data.pageCount > pageNumber) {
        const hrElement = document.createElement('hr');
        listElement.appendChild(hrElement);
        fetchAndUpdateFileSizes(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

function formatFileSize(bytes) {
  const megabytes = (bytes / (1024 * 1024)).toFixed(2);
  return `${megabytes} MB`;
}

fetchAndUpdateFileSizes(1);

function fetchAndUpdateThreadDates(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('postDate');

      threads.forEach((thread, index) => {
        const threadDateElement = document.createElement('p');
        threadDateElement.textContent = formatPostDate(thread.creation);
        listElement.appendChild(threadDateElement);

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateThreadDates(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

function formatPostDate(dateString) {
  const options = { year: '2-digit', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date(dateString).toLocaleString(undefined, options);
}

fetchAndUpdateThreadDates(1);

function fetchAndUpdateThreadReplies(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('postReplies');

      threads.forEach((thread, index) => {
        const threadRepliesElement = document.createElement('p');
        threadRepliesElement.textContent = `Replies: ${thread.posts.length}`;
        listElement.appendChild(threadRepliesElement);

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateThreadReplies(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateThreadReplies(1);

function fetchAndUpdateEmbeds(pageNumber) {
  fetch(`/f/${pageNumber}.json`)
    .then(response => response.json())
    .then(data => {
      const threads = data.threads.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      const listElement = document.getElementById('embed');

      threads.forEach((thread, index) => {
        thread.files.forEach(file => {
          if (file.mime === 'application/x-shockwave-flash') {
            const embedLink = document.createElement('a');
            embedLink.classList.add('embed-link');
            embedLink.textContent = '[Embed]';
            embedLink.href = 'javascript:void(0);';

            embedLink.addEventListener('click', function() {
              const popupContent = document.createElement('div');
              popupContent.classList.add('floatingMenu');
              popupContent.style.display = 'block';
              popupContent.style.left = '60%'; 
              popupContent.style.top = '50%';

var isDragging = false;
var offsetX, offsetY;

function onMouseDown(event) {
  isDragging = true;

  offsetX = event.clientX - popupContent.offsetLeft;
  offsetY = event.clientY - popupContent.offsetTop;

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event) {
  if (isDragging) {
	  
    var newLeft = event.clientX - offsetX;
    var newTop = event.clientY - offsetY;

    popupContent.style.left = newLeft + 'px';
    popupContent.style.top = newTop + 'px';
  }
}

function onMouseUp() {
  isDragging = false;

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

popupContent.addEventListener('mousedown', onMouseDown);
			  
              popupContent.style.transform = 'translate(-50%, -50%)'; 

              const popupHandle = document.createElement('div');
              popupHandle.classList.add('handle');

              const popupLabel = document.createElement('label');
              popupLabel.textContent = 'Flash Embed';

				const closeBtn = document.createElement('span');
				closeBtn.classList.add('coloredIcon', 'glowOnHover', 'close-btn');
				closeBtn.setAttribute('id', 'closeButton');

				closeBtn.addEventListener('click', function() {
					popupContent.style.display = 'none';
				});

              popupHandle.appendChild(popupLabel);
              popupHandle.appendChild(closeBtn);

              const hrElement = document.createElement('hr');

			const objectElement = document.createElement('object');
			objectElement.setAttribute('type', 'application/x-shockwave-flash');
			objectElement.setAttribute('data', file.path);
			objectElement.setAttribute('id', 'flashObject'); 

			const embedElement = document.createElement('embed');
			embedElement.setAttribute('type', 'application/x-shockwave-flash');
			embedElement.setAttribute('src', file.path);

			objectElement.appendChild(embedElement);

              popupContent.appendChild(popupHandle);
              popupContent.appendChild(hrElement);
              popupContent.appendChild(objectElement);

              document.body.appendChild(popupContent);
            });

            listElement.appendChild(embedLink);
          }
        });

        if (index !== threads.length - 1 || pageNumber !== data.pageCount) {
          const hrElement = document.createElement('hr');
          listElement.appendChild(hrElement);
        }
      });

      if (data.pageCount > pageNumber) {
        fetchAndUpdateEmbeds(pageNumber + 1);
      }
    })
    .catch(error => console.error('Error:', error));
}

fetchAndUpdateEmbeds(1);

var currentURI = window.location.href;

if (currentURI.includes("/f/")) {
    var flash = document.querySelector('.flashSection');

    if (flash) {
        flash.style.visibility = 'visible';
        flash.style.display = 'block'; // Change this to 'block' if 'contents' doesn't work as expected
    } else {
        console.error('Element with class "flashSection" not found!');
    }
} else {
    console.error('Current URI does not contain "/f/"');
}
  var currentURI = window.location.pathname;
  
  if (currentURI === "/f/") {
    var elementsToRemove = document.querySelectorAll('.containPages, .boardLinks');
    elementsToRemove.forEach(function(element) {
      element.remove();
    });
	var divThreads = document.getElementById('divThreads');
    divThreads.parentNode.removeChild(divThreads);
	var actionsForm = document.getElementById('actionsForm');
    actionsForm.parentNode.removeChild(actionsForm);
	var contain = document.getElementById('contain');
    contain.parentNode.removeChild(contain);
  }

  if (currentURI !== "/f/") {
    var dynamicFlashBoard = document.getElementById('dynamicFlashBoard');
    dynamicFlashBoard.style.display = 'none';
    var closeSection = document.getElementById('closeSection');
    closeSection.style.display = 'none';
  }
        document.getElementById('closeEmbeds').addEventListener('click', function() {
            var ruffleObjects = document.querySelectorAll('ruffle-object');
            ruffleObjects.forEach(function(obj) {
                obj.remove();
            });
        });

        document.getElementById('closeButton').addEventListener('click', function() {
            const popupContent = document.querySelector('.floatingMenu');
            popupContent.style.display = 'none';
        });