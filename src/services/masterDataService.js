// Mock service for Categories and Exam Types

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const createCrudService = (storageKey, initialData) => {
  const getFromStorage = () => {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(storageKey);
    return items ? JSON.parse(items) : initialData;
  };

  const saveToStorage = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  return {
    async getAll() {
      await delay(300);
      return { data: getFromStorage() };
    },
    async create(data) {
      await delay(300);
      const items = getFromStorage();
      const newItem = { id: Date.now(), ...data };
      const updatedItems = [...items, newItem];
      saveToStorage(updatedItems);
      return newItem;
    },
    async update(id, data) {
      await delay(300);
      let items = getFromStorage();
      items = items.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveToStorage(items);
      return items.find((item) => item.id === id);
    },
    async delete(id) {
      await delay(300);
      let items = getFromStorage();
      items = items.filter((item) => item.id !== id);
      saveToStorage(items);
      return { success: true };
    },
  };
};

export const categoryService = createCrudService('categories', [
  { id: 1, name: 'General Knowledge', description: 'Current affairs and static GK' },
  { id: 2, name: 'Quantitative Aptitude', description: 'Mathematical problems' },
]);

export const examTypeService = createCrudService('examTypes', [
  { id: 1, name: 'Mock Test', description: 'Full-length simulation of an exam' },
  { id: 2, name: 'Topic Test', description: 'Focused test on a single topic' },
]);
