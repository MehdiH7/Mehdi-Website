(() => {
  // Load from localStorage or initialize empty arrays
  let allLists = JSON.parse(localStorage.getItem('allLists')) || [];
  let currentList = JSON.parse(localStorage.getItem('currentList')) || [];

  const form = document.querySelector(".form"); 
  const input = form.querySelector(".form__input");
  const ul = document.querySelector(".toDoList");
  const historyUl = document.querySelector('.historyList');
  const createNewListBtn = document.querySelector('.create-new-list');
  const deleteHistoryBtn = document.querySelector('.delete-history');
  const hamburgerBtn = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-btn');

  // Load existing to-do list items
  loadToDoList();

  // Load history in sidebar
  loadHistory();

  form.addEventListener('submit', e => {
    e.preventDefault();
    let itemId = String(Date.now());
    let toDoItem = input.value;
    let date = new Date().toLocaleDateString();

    addItemToDOM(itemId, toDoItem);
    addItemToArray(itemId, toDoItem, date);
    saveCurrentListToLocalStorage();
    input.value = '';
  });

  ul.addEventListener('click', e => {
    let id = e.target.getAttribute('data-id');
    if (!id) return;
    toggleItemDone(id);
    saveCurrentListToLocalStorage();
  });

  createNewListBtn.addEventListener('click', () => {
    let date = new Date().toLocaleDateString();

    // Save the current list before clearing it
    if (currentList.length > 0) {
      saveCurrentListWithDate(date);
      clearCurrentList();
      loadHistory();
    }
  });

  deleteHistoryBtn.addEventListener('click', () => {
    // Clear all data in localStorage
    localStorage.removeItem('allLists');
    localStorage.removeItem('currentList');
    allLists = [];
    clearCurrentList();
    loadHistory();
  });

  historyUl.addEventListener('click', e => {
    let listIndex = e.target.getAttribute('data-index');
    if (listIndex === null) return;
    loadSpecificList(listIndex);
    closeSidebar();
  });

  hamburgerBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);

  function addItemToDOM(itemId, toDoItem, done = false) {
    const li = document.createElement('li');
    li.setAttribute("data-id", itemId);
    li.innerText = toDoItem;
    if (done) {
      li.classList.add('done');
    }
    ul.appendChild(li);
  }

  function addItemToArray(itemId, toDoItem, date, done = false) {
    currentList.push({ itemId, toDoItem, date, done });
  }

  function toggleItemDone(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    li.classList.toggle('done');
    
    const item = currentList.find(item => item.itemId === id);
    if (item) {
      item.done = !item.done;
    }
  }

  function saveCurrentListToLocalStorage() {
    localStorage.setItem('currentList', JSON.stringify(currentList));
  }

  function saveAllListsToLocalStorage() {
    localStorage.setItem('allLists', JSON.stringify(allLists));
  }

  function clearCurrentList() {
    currentList = [];
    ul.innerHTML = '';
    localStorage.removeItem('currentList');
  }

  function saveCurrentListWithDate(date) {
    // Find how many lists exist for today
    const existingEntriesForDate = allLists.filter(item => item.listId.startsWith(date));
    const count = existingEntriesForDate.length + 1;

    // Create a unique identifier for the list
    const uniqueListIdentifier = `${date} (List ${count})`;

    // Save the list with this identifier
    allLists.push({ listId: uniqueListIdentifier, items: [...currentList] });
    saveAllListsToLocalStorage();
  }

  function loadToDoList() {
    ul.innerHTML = '';
    currentList.forEach(item => addItemToDOM(item.itemId, item.toDoItem, item.done));
  }

  function loadSpecificList(listIndex) {
    ul.innerHTML = '';
    currentList = [...allLists[listIndex].items];
    saveCurrentListToLocalStorage();
    loadToDoList();
  }

  function loadHistory() {
    historyUl.innerHTML = '';
    allLists.forEach((list, index) => {
      const li = document.createElement('li');
      li.setAttribute("data-index", index);
      li.innerText = list.listId;
      historyUl.appendChild(li);
    });
  }

  function openSidebar() {
    sidebar.classList.add('open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
  }
})();
