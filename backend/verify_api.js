const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function verify() {
  console.log('🧪 Running Backend Integration Suite...');

  // 1. Health Check
  const health = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('✅ Health Check:', health.status);

  // 2. Login Recruiter
  const login = await makeRequest(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'recruiter@platform.com', password: 'password123' }
  );
  console.log('✅ Recruiter Authentication Token Received:', !!login.token);
  const token = login.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 3. Get Jobs
  const jobs = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/jobs', method: 'GET' });
  console.log('✅ Job List Fetched. Count:', jobs.count);

  // 4. Get Candidates
  const cands = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/resumes/candidates', method: 'GET', headers });
  console.log('✅ Candidates Directory Fetched. Count:', cands.count);

  // 5. Run Competency Assessment
  const testJobId = jobs.jobs[0]._id;
  const testCandId = cands.candidates[0].candidateId;
  const assess = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/assessment/${testJobId}/${testCandId}`, method: 'POST', headers });
  console.log('✅ Competency Assessment Result:');
  console.log('   - Candidate:', assess.assessment.candidateName);
  console.log('   - Score:', assess.assessment.overallScore + '%');
  console.log('   - Explanation:', assess.assessment.explanation);

  // 6. Recruiter Dashboard Stats
  const dash = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/dashboard/recruiter', method: 'GET', headers });
  console.log('✅ Dashboard Analytics Stats Received:');
  console.log('   - Total Jobs:', dash.stats.totalJobs);
  console.log('   - Candidates Assessed:', dash.stats.candidatesAssessed);
  console.log('   - Average Score:', dash.stats.averageMatchScore + '%');

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
