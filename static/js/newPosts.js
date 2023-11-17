function displayLatestPosts(posts) {
  const postsContainer = document.getElementById('latestPosts');
  postsContainer.innerHTML = '';

  const allPosts = [];

  posts.forEach(postData => {
    postData.posts.forEach(post => {
      if (postData.boardUri && postData.threadId && post.postId && post.message) {
        allPosts.push({
          boardUri: postData.boardUri,
          threadId: postData.threadId,
          postId: post.postId,
          message: post.message,
          creation: post.creation
        });
      }
    });
  });

  allPosts.sort((a, b) => {
    const aDate = new Date(a.creation);
    const bDate = new Date(b.creation);
    return bDate - aDate;
  });

  for (let i = 0; i < Math.min(15, allPosts.length); i++) {
    const post = allPosts[i];
    const postContainer = document.createElement('div');
    postContainer.classList.add('latestPostCell');

    const postLink = document.createElement('a');
    const postUrl = `/${post.boardUri}/res/${post.threadId}.html#${post.postId}`;
    postLink.href = postUrl;
    postLink.style.textAlign = 'left';

    // Truncate message to 28 characters
    const truncatedMessage = post.message.length > 25 ? post.message.substring(0, 25) + '...' : post.message;
    postLink.textContent = truncatedMessage;

    postContainer.appendChild(postLink);

    const boardUriSpan = document.createElement('span');
    boardUriSpan.textContent = `/${post.boardUri}/: `;
    postContainer.insertBefore(boardUriSpan, postLink);

    postsContainer.appendChild(postContainer);

    if (i !== allPosts.length - 1) {
      const hr = document.createElement('hr');
      postsContainer.appendChild(hr);
    }
  }
}


function updatePosts() {
  fetch('/overboard/1.json')
    .then(response => response.json())
    .then(data => {
      displayLatestPosts(data.threads);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

updatePosts();

setInterval(updatePosts, 30000);