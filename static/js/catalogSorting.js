var catalogSorting = {};

// Patches catalog functions to call our sorting functions.
catalogSorting.init = function() {
  const oldSearch = catalog.search;

  // The current sorting method. Restored from persistence if possible.
  catalogSorting.currentMethod =
    localStorage.getItem("catalogSort") || "Bump order";

  catalog.search = function() {
      catalog.catalogDiv.style.display = "none";
      catalogSorting.sortThreads();
      oldSearch();
      catalog.catalogDiv.style.display = "block";
  };

  // if the catalog data was loaded before our script initialized,
  // then just kick start it
  if (catalog.catalogThreads) {
    catalogSorting.initSort();
  } else {
    // this hack is required because by the time catalogSorting.init executes,
    // catalog.getCatalogData() has executed but the response hasn't been received
    // yet, so we can trigger our actions when the data is being written by
    // catalog.getCatalogData.
    Object.defineProperty(catalog, "catalogThreads", {
      set: function(value) {
        // delete the custom setter
        delete catalog.catalogThreads;
        // replace with actual value
        catalog.catalogThreads = value;
        // call our hook
        catalogSorting.initSort();
      },
      configurable: true
    });
  }
};

// Sorts pinned thread first, then sorts by the given field in descending order.
catalog.sortByField = function(a, b, field) {
  if (a.pinned) return -1;
  else if (b.pinned) return 1;

  if ((a[field] || 0) > (b[field] || 0)) return -1;
  if ((a[field] || 0) < (b[field] || 0)) return 1;
  return 0;
};

// A list of methods to sort.
catalogSorting.methods = new Map([
  ["Bump order", "lastBump"],
  //["Last reply", "lastReply"],
  ["Creation date", "threadId"],
  ["Reply count", "postCount"]
]);

// Updates the current sorting method, also persists it.
catalogSorting.updateMethod = function(value) {
  localStorage.setItem("catalogSort", value);
  catalogSorting.currentMethod = value;
};

// Uses the current sorting method to sort the threads.
catalogSorting.sortThreads = function() {
  var method = catalogSorting.methods.get(catalogSorting.currentMethod);
  //XXX this doesn't really account for ascending/descending sorting
  //maybe make the Map above have lists as values
  catalog.catalogThreads.sort((a, b) => catalog.sortByField(a, b, method));
};

// Initializes the sorting menu.
catalogSorting.initSort = function() {
  const sortingLabel = document.createElement("label");
  sortingLabel.appendChild(document.createTextNode("Sort by: "));

  const sortSelect = document.createElement("select");

  catalogSorting.methods.forEach((value, key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;

    sortSelect.appendChild(option);
  });
  sortSelect.value = catalogSorting.currentMethod;

  sortSelect.addEventListener("change", function() {
    catalogSorting.updateMethod(this.value);
    catalog.search();
  });

  sortingLabel.appendChild(sortSelect);

  const divTools = document.getElementById("divTools");
  divTools.insertBefore(sortingLabel, divTools.firstChild);

  // do the initial sorted update
  if (catalogSorting.currentMethod !== "Bump order") {
    catalog.search();
  } else {
    catalog.catalogDiv.style.display = "block";
  }
};

catalogSorting.init();
