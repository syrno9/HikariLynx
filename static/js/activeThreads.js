function displayLatestThreads(data) {
  const sortedThreads = data.threads.sort((a, b) => b.posts.length - a.posts.length);

  const threadsContainer = document.getElementById('threads-container');
  threadsContainer.innerHTML = '';

  for (let i = 0; i < 3 && i < sortedThreads.length; i++) {
    const threadData = sortedThreads[i];
    const threadContainer = document.createElement('div');
    threadContainer.classList.add('activeThreadCell');

    const threadLink = document.createElement('a');
    threadLink.href = `/${threadData.boardUri}/res/${threadData.threadId}.html`;
    threadLink.classList.add('thread-link');
    threadLink.style.textAlign = 'left';
    threadContainer.appendChild(threadLink);

    const threadBoard = document.createElement('p');
    const boardName = `Board: /${threadData.boardUri}/`;
    threadBoard.textContent = boardName.length > 130 ? boardName.substring(0, 130) + '...' : boardName;
    threadBoard.style.textAlign = 'left';
    threadContainer.appendChild(threadBoard);

    if (threadData.files && threadData.files.length > 0) {
      const threadImage = document.createElement('img');
      threadImage.classList.add('thread-image');
      threadImage.src = threadData.files[0].thumb;
      threadImage.style.textAlign = 'left';
      threadLink.appendChild(threadImage);
    }

    const threadMessage = document.createElement('p');
    const messageText = threadData.message.substring(0, 130) + (threadData.message.length > 130 ? '...' : '');
    threadMessage.textContent = messageText;
    threadMessage.style.textAlign = 'left';
    threadLink.appendChild(threadMessage);

    threadsContainer.appendChild(threadContainer);

    if (i < 2 && i < sortedThreads.length - 1) {
      const hrElement = document.createElement('hr');
      hrElement.style.textAlign = 'left';
      threadsContainer.appendChild(hrElement);
    }
  }
}

function updateThreads() {
  fetch('/overboard/1.json')
    .then(response => response.json())
    .then(data => {
      displayLatestThreads(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

updateThreads();

setInterval(updateThreads, 30000);
