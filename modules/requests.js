// ═══ REQUESTS MODULE ═══
// Service requests data and management

const SAMPLE_REQUESTS = [
  {id:1, client:'Rahul Agarwal', email:'rahul@example.com', service:'Income Tax (ITR)', date:'22 Jul 2026', status:'pending', amount:'₹2,999'},
  {id:2, client:'Priya Sharma', email:'priya@example.com', service:'GST Registration', date:'21 Jul 2026', status:'progress', amount:'₹3,499'},
  {id:3, client:'Mukesh Kumar', email:'mukesh@example.com', service:'Company Registration', date:'20 Jul 2026', status:'completed', amount:'₹8,999'},
  {id:4, client:'Anjali Singh', email:'anjali@example.com', service:'TDS Compliance', date:'19 Jul 2026', status:'pending', amount:'₹1,499'},
  {id:5, client:'Arun Patel', email:'arun@example.com', service:'Trademark Registration', date:'18 Jul 2026', status:'hold', amount:'₹2,999'},
];

/* GET ALL REQUESTS */
function getAllRequests() {
  return SAMPLE_REQUESTS;
}

/* GET REQUEST BY ID */
function getRequestById(id) {
  return SAMPLE_REQUESTS.find(r => r.id === id);
}

/* GET REQUESTS BY STATUS */
function getRequestsByStatus(status) {
  return SAMPLE_REQUESTS.filter(r => r.status === status);
}

/* UPDATE REQUEST STATUS */
function updateRequestStatus(id, newStatus) {
  const request = getRequestById(id);
  if (request) {
    request.status = newStatus;
    return true;
  }
  return false;
}

/* GET REQUEST STATS */
function getRequestStats() {
  return {
    total: SAMPLE_REQUESTS.length,
    pending: SAMPLE_REQUESTS.filter(r => r.status === 'pending').length,
    progress: SAMPLE_REQUESTS.filter(r => r.status === 'progress').length,
    completed: SAMPLE_REQUESTS.filter(r => r.status === 'completed').length,
    hold: SAMPLE_REQUESTS.filter(r => r.status === 'hold').length,
  };
}

console.log('✅ Requests module loaded -', SAMPLE_REQUESTS.length, 'requests');
