// helper profile snippet - will be inserted into pages.js
function renderProfile(){
  const html = `
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-3xl">
        <div class="flex items-center gap-6 mb-6">
          <img src="https://via.placeholder.com/96" alt="Admin avatar" class="w-24 h-24 rounded-full">
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">Admin User</p>
            <p class="text-sm text-gray-600 dark:text-gray-300">admin@marketmix.com</p>
            <p class="text-sm text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Full name</label>
            <input class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" value="Admin User">
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" value="admin@marketmix.com">
          </div>
          <div class="flex gap-3">
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded">Change password</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
}
