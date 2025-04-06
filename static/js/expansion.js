document.addEventListener('DOMContentLoaded', function() {
  const threads = document.querySelectorAll('.opCell');

  threads.forEach(thread => {
    const omissionMessage = thread.querySelector('.labelOmission');

    if (omissionMessage) {
      // Create the button
      const expandButton = document.createElement('span');
      expandButton.classList.add('expandButton');
      expandButton.setAttribute('title', 'Expand Thread');

      // Insert the button before the omission message
      omissionMessage.parentNode.insertBefore(expandButton, omissionMessage);

      let repliesExpanded = false;
      let fetchedPosts = [];

      // Add click event to the button
      expandButton.addEventListener('click', function() {
        if (!repliesExpanded) {
          const threadId = thread.id;
          const threadUri = thread.getAttribute('data-boarduri');
          const jsonUrl = `/${threadUri}/res/${threadId}.json`;

          fetch(jsonUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
              }
              return response.json();
            })
            .then(data => {
              const postsContainer = thread.querySelector('.divPosts');
              const existingPostIds = Array.from(postsContainer.querySelectorAll('.postCell')).map(postCell => postCell.id);

              data.posts.forEach(post => {
                if (!existingPostIds.includes(post.postId.toString())) {
                  const postCell = document.createElement('div');
                  postCell.classList.add('postCell');
                  postCell.setAttribute('data-boarduri', threadUri);
                  postCell.setAttribute('id', post.postId);

                  let imageHtml = '';
                  if (post.files && post.files.length > 0) {
                    post.files.forEach(file => {
                      imageHtml += `
                        <div class="panelUploads">
                          <figure class="uploadCell">
                            <div class="uploadDetails">
                              <a class="nameLink" target="_blank" href="${file.path}"></a>
                              <a class="hideFileButton glowOnHover coloredIcon"></a>
                              <span class="hideMobile">(</span>
                              <span class="sizeLabel">${(file.size / 1024).toFixed(2)} KB</span>
                              <span class="dimensionLabel">${file.width}x${file.height}</span>
                              <a class="originalNameLink" href="${file.path}" download="${file.originalName}">${file.originalName}</a>
                              <span class="hideMobile">)</span>
                            </div>
                            <div></div>
                            <a class="imgLink" target="_blank" href="${file.path}" data-filewidth="${file.width}" data-fileheight="${file.height}" data-filemime="${file.mime}">
                              <img loading="lazy" src="${file.thumb}" height="250">
                            </a>
                          </figure>
                        </div>
                      `;
                    });
                  }

                  postCell.innerHTML = `
                    <div class="mobileHide" style="float: left; margin-right: 3px; font-size: small">&gt;&gt;</div>
                    <div class="innerPost">
                      <div class="postInfo title">
                        <input type="checkbox" class="deletionCheckBox" name="${threadUri}-${threadId}-${post.postId}">
                        <span class="hideButton glowOnHover coloredIcon" title="Hide"></span>
                        <a class="linkName noEmailName">${post.name}</a>
                        <span class="labelCreated">${new Date(post.creation).toLocaleString()}</span>
                        <a class="linkSelf" href="#${post.postId}">No.</a>
                        <a class="linkQuote" href="#q${post.postId}">${post.postId}</a>
                        <a class="postButton"></a>
                        <span class="extraMenuButton glowOnHover coloredIcon" title="Post Menu"></span>
                        <span class="panelBacklinks"></span>
                      </div>
                      <div></div>
                      ${imageHtml}
                      <div class="divMessage">${post.markdown}</div>
                    </div>
                  `;

                  fetchedPosts.push(postCell);
                }
              });

              // Insert new posts in reverse order
              fetchedPosts.reverse().forEach(postCell => {
                postsContainer.insertBefore(postCell, postsContainer.firstChild);
              });

              repliesExpanded = true;
              expandButton.classList.remove('expandButton');
              expandButton.classList.add('collapseButton');
              expandButton.setAttribute('title', 'Collapse Thread');
            })
            .catch(error => {
              console.error('Error fetching the JSON file:', error);
            });
        } else {
          // Remove fetched posts
          fetchedPosts.forEach(postCell => postCell.remove());
          fetchedPosts = [];

          repliesExpanded = false;
          expandButton.classList.remove('collapseButton');
          expandButton.classList.add('expandButton');
          expandButton.setAttribute('title', 'Expand Thread');
        }
      });
    }
  });
});
