function toSalary(user) {
  return {
    basic: user.salaryBasic,
    hra: user.salaryHra,
    allowances: user.salaryAllowances,
    pf: user.salaryPf,
  };
}

// Shape used by AuthContext (login/signup response) and generally as the
// "who am I" object the frontend keeps in localStorage.
function toAuthUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    loginId: user.loginId,
    avatarUrl: user.avatarUrl || null,
  };
}

// Shape used by GET /employees (list) + POST /employees response.
function toEmployeeListItem(user, status) {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl || null,
    status: status || 'absent',
  };
}

// Shape used by GET/PATCH /employees/:id (full record, admin view).
function toEmployeeDetail(user, status) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    dob: user.dob || '',
    avatarUrl: user.avatarUrl || null,
    jobTitle: user.jobTitle || '',
    department: user.department || '',
    joinDate: user.joinDate || '',
    status: status || 'absent',
    salary: toSalary(user),
  };
}

// Shape used by GET/PATCH /profile (self view).
function toProfile(user) {
  return {
    id: user.id,
    name: user.name,
    loginId: user.loginId,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    dob: user.dob || '',
    avatarUrl: user.avatarUrl || null,
    about: user.about || '',
    skills: user.skills || '',
    jobTitle: user.jobTitle || '',
    department: user.department || '',
    joinDate: user.joinDate || '',
    salary: toSalary(user),
    documents: [],
  };
}

function toAttendanceRow(record, employeeName) {
  return {
    employeeName,
    checkIn: record.checkIn || null,
    checkOut: record.checkOut || null,
    workHours: record.workHours ?? null,
    extraHours: record.extraHours ?? null,
    status: record.status || 'Absent',
  };
}

function toTimeOffRequestRow(req, employeeName) {
  return {
    id: req.id,
    employeeName,
    type: req.type,
    startDate: req.startDate,
    endDate: req.endDate,
    status: req.status,
    remarks: req.remarks || '',
  };
}

module.exports = {
  toSalary,
  toAuthUser,
  toEmployeeListItem,
  toEmployeeDetail,
  toProfile,
  toAttendanceRow,
  toTimeOffRequestRow,
};
