export async function addItem(name, when, what) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/add_${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        when,
        what,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function getEveryItem(name) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/get_every_${name}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function getItem(name, id) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/get_${name}/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function updateItem(name, id, when, what) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/update_${name}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        when,
        what,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function deleteItem(name, id) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/delete_${name}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function getTodaysPlans() {
  try {
    const response = await fetch(`http://127.0.0.1:5000/get_todays_plans`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
