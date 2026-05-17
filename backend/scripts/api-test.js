/**
 * Full API integration test. Run: node scripts/api-test.js
 * Requires server at BASE_URL (default http://localhost:5000).
 */
const BASE = process.env.BASE_URL || "http://localhost:5000";
const email = `apitest_${Date.now()}@example.com`;
const password = "testpass123";

let token = "";
let listId = "";
let movieId = "";
let defaultListId = "";
let failures = 0;

async function req(method, path, { body, auth = true, expectStatus } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  const ok = expectStatus ? res.status === expectStatus : res.ok;
  if (!ok) {
    failures += 1;
    console.error(`FAIL ${method} ${path} -> ${res.status}`, data);
  } else {
    console.log(`OK   ${method} ${path} -> ${res.status}`);
  }
  return { res, data };
}

async function run() {
  console.log(`Testing API at ${BASE}\n`);

  await req("GET", "/api/health", { auth: false, expectStatus: 200 });
  if (!(await req("GET", "/api/health", { auth: false })).data?.ok) {
    console.error("Health check did not return ok:true");
    failures += 1;
  }

  await req("GET", "/api/lists", { expectStatus: 401 });

  const reg = await req("POST", "/api/auth/register", {
    auth: false,
    expectStatus: 201,
    body: { email, password, displayName: "API Tester" }
  });
  token = reg.data?.data?.token;
  if (!token) {
    console.error("No token from register");
    process.exit(1);
  }

  await req("POST", "/api/auth/login", {
    auth: false,
    expectStatus: 200,
    body: { email, password }
  });

  await req("GET", "/api/auth/me", { expectStatus: 200 });

  const lists = await req("GET", "/api/lists", { expectStatus: 200 });
  const allLists = lists.data?.data || [];
  if (allLists.length === 0) {
    failures += 1;
    console.error("FAIL: register should create default list");
  } else {
    defaultListId = allLists[0]._id;
    console.log(`     default list: ${defaultListId}`);
  }

  const newList = await req("POST", "/api/lists", {
    expectStatus: 201,
    body: { name: "Weekend Queue", description: "Test list" }
  });
  listId = newList.data?.data?._id;
  if (!listId) {
    failures += 1;
    console.error("FAIL: no listId from create list");
    process.exit(1);
  }

  await req("GET", `/api/lists/${listId}`, { expectStatus: 200 });
  await req("PATCH", `/api/lists/${listId}`, {
    expectStatus: 200,
    body: { description: "Updated description" }
  });
  await req("GET", `/api/lists/${listId}`, { expectStatus: 200 });

  const movie = await req("POST", `/api/lists/${listId}/movies`, {
    expectStatus: 201,
    body: {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 8.8,
      status: "planned",
      notes: "API test"
    }
  });
  movieId = movie.data?.data?._id;
  if (!movieId) {
    failures += 1;
    console.error("FAIL: no movieId from create movie");
    process.exit(1);
  }

  await req("GET", `/api/lists/${listId}/movies`, { expectStatus: 200 });
  await req("GET", `/api/lists/${listId}/movies?status=planned`, { expectStatus: 200 });
  await req("GET", `/api/lists/${listId}/movies?q=incep`, { expectStatus: 200 });
  await req("GET", `/api/lists/${listId}/movies/${movieId}`, { expectStatus: 200 });
  await req("PATCH", `/api/lists/${listId}/movies/${movieId}`, {
    expectStatus: 200,
    body: { status: "watching" }
  });
  await req("DELETE", `/api/lists/${listId}/movies/${movieId}`, { expectStatus: 204 });

  await req("GET", `/api/lists/${listId}/movies/${movieId}`, { expectStatus: 404 });
  await req("GET", `/api/lists/000000000000000000000000`, { expectStatus: 404 });
  await req("GET", `/api/lists/not-an-id`, { expectStatus: 400 });

  await req("DELETE", `/api/lists/${listId}`, { expectStatus: 204 });
  await req("GET", `/api/lists/${listId}`, { expectStatus: 404 });

  console.log(`\n${failures === 0 ? "All tests passed." : `${failures} test(s) failed.`}`);
  process.exit(failures > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err.message);
  if (err.cause?.code === "ECONNREFUSED") {
    console.error("Is the server running? cd backend && npm run dev");
  }
  process.exit(1);
});
