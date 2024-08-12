(() => {
  let allLists = [];
  let currentList = [];
  let currentListId = null;
  let sharedLists = []; // Keep track of shared lists separately

  const form = document.querySelector(".form"); 
  const input = form.querySelector(".form__input");
  const ul = document.querySelector(".toDoList");
  const historyUl = document.querySelector('.historyList');
  const sharedUl = document.querySelector('.sharedList'); // New shared list section
  const createBlankListBtn = document.querySelector('.create-blank-list');
  const saveCurrentListBtn = document.querySelector('.save-current-list');
  const deleteHistoryBtn = document.querySelector('.delete-history');
  const hamburgerBtn = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-btn');
  const listTitleInput = document.getElementById('listTitle'); // New input for list title
  const shareEmailInput = document.getElementById('shareEmail'); // New input for sharing
  const shareListBtn = document.querySelector('.share-list'); // New button for sharing
  const authModal = document.getElementById('authModal');
  const userEmailDisplay = document.getElementById('userEmail');

  // Selecting the elements for authentication
  const signUpBtn = document.getElementById('signUpBtn');
  const logInBtn = document.getElementById('logInBtn');
  const logOutBtn = document.getElementById('logOutBtn');
  const emailInput = document.getElementById('email'); 
  const passwordInput = document.getElementById('password'); 




  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();

  db.enablePersistence()
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.error('Failed to enable persistence: Multiple tabs open, persistence can only be enabled in one tab.');
      } else if (err.code === 'unimplemented') {
        console.error('Persistence is not available on this browser.');
      }
    });

  signUpBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('User signed up:', userCredential.user);
        displayUserInfo(userCredential.user);
        closeAuthModal();
      })
      .catch(error => {
        console.error('Sign Up Error:', error);
      });
  });

  logInBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('User logged in:', userCredential.user);
        displayUserInfo(userCredential.user);
        closeAuthModal();
      })
      .catch(error => {
        console.error('Login Error:', error);
      });
  });

  logOutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        console.log('User logged out');
        clearCurrentList();
        clearHistory();
        clearSharedList();
        showAuthModal();
      })
      .catch(error => {
        console.error('Logout Error:', error);
      });
  });

  auth.onAuthStateChanged(user => {
    if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        
        userDocRef.get().then(doc => {
            if (!doc.exists) {
                // Create a new document for the user with their email
                userDocRef.set({
                    email: user.email,
                    history: [],
                    currentList: [],
                    sharedWithMe: []
                }).then(() => {
                    console.log(`Email added to user document: ${user.email}`);
                }).catch(error => {
                    console.error('Error adding email to user document: ', error);
                });
            } else if (!doc.data().email) {
                // Update existing document if the email field is missing
                userDocRef.update({
                    email: user.email
                }).then(() => {
                    console.log(`Email added to user document: ${user.email}`);
                }).catch(error => {
                    console.error('Error updating email in user document: ', error);
                });
            }
        });

        loadUserToDoList(user.uid);
        displayUserInfo(user);
        closeAuthModal();
    } else {
        clearCurrentList();
        clearHistory();
        clearSharedList();
        showAuthModal();
    }
});

  form.addEventListener('submit', e => {
    e.preventDefault();
    const itemId = String(Date.now());
    const toDoItem = input.value;
    const userId = auth.currentUser.uid;

    addItemToList(itemId, toDoItem);
    input.value = '';
    updateCurrentListInFirestore(userId); // Update the current list in Firestore after adding an item
  });

  ul.addEventListener('click', e => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;
    const userId = auth.currentUser.uid;

    toggleItemDone(id);
    updateCurrentListInFirestore(userId); // Update the current list in Firestore after toggling an item
  });

  saveCurrentListBtn.addEventListener('click', () => {
    const userId = auth.currentUser.uid;

    if (currentList.length > 0) {
      saveCurrentListToFirestore(userId); // Save current list as a single entry in history
      loadHistory(userId); // Reload history sidebar to include the new list
    }
  });

  createBlankListBtn.addEventListener('click', () => {
    clearCurrentList(); // Clear the current list for new entries
    currentListId = null; // Reset the currentListId to indicate a fresh list
    saveCurrentListBtn.style.display = 'block'; // Ensure the save button is visible
    listTitleInput.value = ''; // Clear the list title input
  });

  deleteHistoryBtn.addEventListener('click', () => {
    const userId = auth.currentUser.uid;

    db.collection('users').doc(userId).update({
      history: firebase.firestore.FieldValue.delete(),
      sharedWithMe: firebase.firestore.FieldValue.delete() // Clear shared lists as well
    }).then(() => {
      console.log('User history deleted');
      clearHistory();
      clearSharedList(); // Clear the shared list section
    }).catch(error => {
      console.error('Error deleting history:', error);
    });
  });

  historyUl.addEventListener('click', e => {
    const listIndex = e.target.getAttribute('data-index');
    if (listIndex === null) return;

    loadSpecificList(listIndex); // Load specific list without saving to Firestore
    closeSidebar();
    saveCurrentListBtn.style.display = 'none'; // Hide the save button when loading an existing list
  });

  historyUl.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('delete-list')) {
      const listIndex = target.getAttribute('data-index');
      const userId = auth.currentUser.uid;
      deleteSpecificList(listIndex, userId);
      closeSidebar();
    }
  });

  // Handle clicks on the shared lists
  sharedUl.addEventListener('click', e => {
    const listIndex = e.target.getAttribute('data-shared-index');
    if (listIndex === null) return;

    loadSharedSpecificList(listIndex); // Load specific shared list
    closeSidebar();
    saveCurrentListBtn.style.display = 'none'; // Hide the save button when loading a shared list
  });

  hamburgerBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);

  // Share list with another user
  shareListBtn.addEventListener('click', () => {
    const shareEmail = shareEmailInput.value.trim();
    const userId = auth.currentUser.uid;
    if (currentListId && shareEmail) {
      shareListWithUser(shareEmail, { listId: currentListId, items: [...currentList] });
    }
  });

  function loadUserToDoList(userId) {
    const userDocRef = db.collection('users').doc(userId);

    userDocRef.get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                allLists = data.history || [];
                currentList = data.currentList || [];
                sharedLists = data.sharedWithMe || [];
                loadToDoList();
                loadHistory(userId);
                loadSharedList(); // Load lists shared with the user
            } else {
                userDocRef.set({ history: [], currentList: [], sharedWithMe: [] });
                allLists = [];
                currentList = [];
                sharedLists = [];
            }
        })
        .catch(error => {
            console.error('Error loading to-do list:', error);
        });
}


  function saveCurrentListToFirestore(userId) {
    const title = listTitleInput.value || "Untitled";
    const date = new Date().toLocaleDateString();
    const existingEntriesForDate = allLists.filter(item => item.listId.startsWith(date));
    const count = existingEntriesForDate.length + 1;
    const uniqueListIdentifier = `${title} (${date} - List ${count})`;

    allLists.push({ listId: uniqueListIdentifier, items: [...currentList] });

    db.collection('users').doc(userId).set({
      history: allLists,
      currentList: [],
      sharedWithMe: sharedLists // Ensure shared lists are not overwritten
    })
    .then(() => {
      console.log('To-do list successfully saved to Firestore');
      currentListId = uniqueListIdentifier;
    })
    .catch(error => {
      console.error('Error saving to-do list:', error);
    });
  }

  function updateCurrentListInFirestore(userId) {
    if (currentListId) {
      db.collection('users').doc(userId).update({
        history: allLists,
        currentList: currentList,
        sharedWithMe: sharedLists // Ensure shared lists are updated
      }).then(() => {
        console.log('To-do list successfully updated in Firestore');
      }).catch(error => {
        console.error('Error updating to-do list:', error);
      });
    }
  }

  function addItemToList(itemId, toDoItem) {
    addItemToDOM(itemId, toDoItem);
    currentList.push({ itemId, toDoItem, done: false });
  }

  function toggleItemDone(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    li.classList.toggle('done');
    
    const item = currentList.find(item => item.itemId === id);
    if (item) {
      item.done = !item.done;
    }
  }

  function loadToDoList() {
    ul.innerHTML = '';
    currentList.forEach(item => addItemToDOM(item.itemId, item.toDoItem, item.done));
  }

  function loadSpecificList(listIndex) {
    currentList = [...allLists[listIndex].items];
    currentListId = allLists[listIndex].listId; // Set the current list ID to the one loaded
    loadToDoList(); // Just load the list, no saving to Firestore
    listTitleInput.value = currentListId.split(' (')[0]; // Set the title input to the loaded list title
  }

  function loadSharedSpecificList(listIndex) {
    const sharedList = sharedLists[listIndex];
    if (!sharedList) return;

    currentList = sharedList.items || [];
    currentListId = sharedList.listId || null;
    loadToDoList(); // Just load the shared list
    listTitleInput.value = currentListId ? currentListId.split(' (')[0] : ''; // Set the title input to the loaded shared list title
  }

  function deleteSpecificList(listIndex, userId) {
    allLists.splice(listIndex, 1); // Remove the list from the array
    db.collection('users').doc(userId).update({
      history: allLists,
      sharedWithMe: sharedLists // Ensure shared lists are not affected
    }).then(() => {
      console.log('List successfully deleted');
      loadHistory(userId); // Reload history sidebar to reflect the deletion
    }).catch(error => {
      console.error('Error deleting list:', error);
    });
  }

  function loadHistory(userId) {
    historyUl.innerHTML = '';
    allLists.forEach((list, index) => {
      const li = document.createElement('li');
      li.setAttribute("data-index", index);
      li.innerHTML = `${list.listId} <button class="delete-list" data-index="${index}">Delete</button>`;
      historyUl.appendChild(li);
    });
  }

  function loadSharedList() {
    sharedUl.innerHTML = '';
    sharedLists.forEach((list, index) => {
      const li = document.createElement('li');
      li.setAttribute("data-shared-index", index);
      li.textContent = list.listId;
      sharedUl.appendChild(li);
    });
  }

function shareListWithUser(email, list) {
    const usersRef = db.collection('users');
  
    console.log(`Attempting to find user with email: ${email}`);
  
    usersRef.where('email', '==', email).get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          console.log('No user found with that email');
          alert('No user found with that email.');
          return;
        }
  
        querySnapshot.forEach(doc => {
          const invitedUserId = doc.id; // Get the UID from the document ID
          console.log(`Found user with ID: ${invitedUserId}, sharing list...`);
          addListToUserSharedLists(invitedUserId, list);
        });
      })
      .catch(error => {
        console.error('Error finding user by email: ', error);
      });
  }

  function addListToUserSharedLists(userId, list) {
    const userDocRef = db.collection('users').doc(userId);
  
    userDocRef.update({
      sharedWithMe: firebase.firestore.FieldValue.arrayUnion(list)
    })
    .then(() => {
      console.log('List successfully shared');
      alert('List successfully shared!');
    })
    .catch(error => {
      console.error('Error sharing list: ', error);
    });
  }

  function addItemToDOM(itemId, toDoItem, done = false) {
    const li = document.createElement('li');
    li.setAttribute("data-id", itemId);
    li.innerText = toDoItem;
    if (done) {
      li.classList.add('done');
    }
    ul.appendChild(li);
  }

  function clearCurrentList() {
    currentList = [];
    ul.innerHTML = '';
    currentListId = null; // Reset current list ID
  }

  function clearHistory() {
    allLists = [];
    historyUl.innerHTML = '';
  }

  function clearSharedList() {
    sharedUl.innerHTML = ''; // Clear the shared list section
  }

  function openSidebar() {
    sidebar.classList.add('open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
  }

  function showAuthModal() {
    authModal.style.display = 'flex';
  }

  function closeAuthModal() {
    authModal.style.display = 'none';
  }

  function displayUserInfo(user) {
    userEmailDisplay.innerText = `Logged in as: ${user.email}`;
  }
})();
