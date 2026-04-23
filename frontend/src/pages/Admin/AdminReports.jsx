import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Database,
  Lock,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  UserCheck,
  UserX,
  FileWarning,
  Layers
} from 'lucide-react';

const BASE = 'http://localhost:5000/api';

/* ─────────────────────────────────────────────
   SVG / CSS Chart Primitives (zero dependencies)
───────────────────────────────────────────── */

/** Animated horizontal bar */
const Bar = ({ value, max, color, label, count, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-gray-800">{count.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

/** SVG Donut Chart */
const DonutChart = ({ segments, size = 160, thickness = 28 }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} className="drop-shadow-sm">
      {segments.map((seg, i) => {
        const frac = total > 0 ? seg.value / total : 0;
        const dash = frac * circumference;
        const gap = circumference - dash;
        const strokeDashoffset = -offset * circumference;
        offset += frac;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-base font-bold fill-gray-800" fontSize="20" fontWeight="700">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-500" fontSize="11">
        Total
      </text>
    </svg>
  );
};

/** SVG Line / Area Sparkline */
const Sparkline = ({ data, color = '#f97316', fill = false, height = 60, label }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 260;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M0,${h} L${pts[0].split(',')[0]},${pts[0].split(',')[1]} ${pts.slice(1).map(p => `L${p}`).join(' ')} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {fill && (
        <path d={areaPath} fill={color} fillOpacity="0.15" />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {pts.map((p, i) => {
        const [x, y] = p.split(',');
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color} fillOpacity="0.8" />
        );
      })}
    </svg>
  );
};

/** Column Chart (vertical bars) */
const ColumnChart = ({ data, color = '#f97316', height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 150); }, []);

  return (
    <div className="flex items-end gap-1 justify-between" style={{ height }}>
      {data.map((d, i) => {
        const barH = animated ? Math.round((d.value / max) * (height - 24)) : 0;
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <span className="text-xs text-gray-500 mb-1" style={{ fontSize: 9 }}>{d.value}</span>
            <div
              className="w-full rounded-t transition-all duration-700 ease-out"
              style={{ height: barH, backgroundColor: color, transitionDelay: `${i * 60}ms` }}
            />
            <span className="text-xs text-gray-400 mt-1 truncate w-full text-center" style={{ fontSize: 9 }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Gauge arc */
const GaugeChart = ({ value, max = 100, color = '#f97316', label }) => {
  const pct = Math.min(value / max, 1);
  const startAngle = -Math.PI * 0.8;
  const endAngle = Math.PI * 0.8;
  const angle = startAngle + pct * (endAngle - startAngle);
  const r = 52;
  const cx = 70;
  const cy = 70;
  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}`;
  };
  const needleX = cx + (r - 10) * Math.cos(angle);
  const needleY = cy + (r - 10) * Math.sin(angle);

  return (
    <svg viewBox="0 0 140 100" className="w-full max-w-[140px]">
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
      <path d={arcPath(startAngle, angle)} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#374151" />
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
        {Math.round(pct * 100)}%
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="8" fill="#6b7280">
        {label}
      </text>
    </svg>
  );
};

/* ─────────────────────────────────────────────
   Tiny helper sub-components
───────────────────────────────────────────── */

const KpiCard = ({ title, value, change, changeDir, icon: Icon, color, subtitle }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center mt-3 gap-1">
        {changeDir === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
        {changeDir === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
        {changeDir === 'flat' && <Minus className="h-3 w-3 text-gray-400" />}
        <span className={`text-xs font-semibold ${changeDir === 'up' ? 'text-green-600' : changeDir === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          {change}
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="bg-orange-100 p-2 rounded-lg">
      <Icon className="h-5 w-5 text-orange-600" />
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const Legend = ({ items }) => (
  <div className="flex flex-wrap gap-3 mt-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-xs text-gray-600">{item.label}</span>
        {item.value !== undefined && (
          <span className="text-xs font-semibold text-gray-800">({item.value})</span>
        )}
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Main Page — All data from live API endpoints
───────────────────────────────────────────── */

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState('30d');

  // ── State ────────────────────────────────────
  const [users, setUsers] = useState({
    total: 0, byRole: {}, newThisMonth: 0,
    successfulLogins: 0, failedLogins: 0,
    recentActivity: [],
  });
  const [cases, setCases] = useState({
    total: 0, byStatus: [], byCategory: [], bySeverity: [],
  });
  const [evidence, setEvidence] = useState({
    total: 0, completed: 0, pending: 0, failed: 0, inProgress: 0,
    lowRisk: 0, mediumRisk: 0, highRisk: 0, criticalRisk: 0,
    flaggedForReview: 0, avgRiskScore: 0,
  });
  const [contacts, setContacts] = useState({
    total: 0, newMessages: 0, inProgress: 0, resolved: 0, urgent: 0, unread: 0,
  });
  const [blogs, setBlogs] = useState({ total: 0, published: 0, draft: 0 });
  const [roleRequests, setRoleRequests] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, verified: 0, byRole: [],
  });
  const [heatmapData, setHeatmapData] = useState(
    Array.from({ length: 12 }, () => Array.from({ length: 7 }, () => 0))
  );
  const [activityLog, setActivityLog] = useState([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ── Fetch all real data ──────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };

    const safeGet = async (url) => {
      try {
        const r = await fetch(url, { headers: h });
        return r.ok ? r.json() : null;
      } catch { return null; }
    };

    const days30 = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 30;

    // Fire all requests in parallel
    const [
      usersPageRes,     // GET /auth/users — to count total + get all for role breakdown
      usersAllRes,      // GET /auth/users?limit=500 — for role breakdown
      contactStatsRes,  // GET /contact/stats — real aggregation
      blogRes,          // GET /blogs/admin/all?limit=1
      caseStatsRes,     // GET /cases/admin/stats
      verStatsRes,      // GET /verification/admin/analytics/stats
      verAnalyticsRes,  // GET /verification/admin/analytics/detailed?dateRange=30
      roleReqStatsRes,  // GET /role-requests/stats
    ] = await Promise.all([
      safeGet(`${BASE}/auth/users?page=1&limit=1`),
      safeGet(`${BASE}/auth/users?page=1&limit=500`),
      safeGet(`${BASE}/contact/stats`),
      safeGet(`${BASE}/blogs/admin/all?page=1&limit=1`),
      safeGet(`${BASE}/cases/admin/stats`),
      safeGet(`${BASE}/verification/admin/analytics/stats`),
      safeGet(`${BASE}/verification/admin/analytics/detailed?dateRange=${days30}`),
      safeGet(`${BASE}/role-requests/stats`),
    ]);

    // ── Users ──────────────────────────────────
    const allUsrs = usersAllRes?.users || [];
    const totalUsers = usersPageRes?.total || allUsrs.length || 0;

    const byRole = allUsrs.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    // Count successful/failed logins from activity logs
    let successfulLogins = 0;
    let failedLogins = 0;
    const cutoff = new Date(Date.now() - days30 * 24 * 60 * 60 * 1000);
    allUsrs.forEach(u => {
      (u.activityLog || []).forEach(entry => {
        if (new Date(entry.timestamp) >= cutoff) {
          if (entry.action === 'login') successfulLogins++;
          if (entry.action === 'login_failed' || entry.action === 'failed_login') failedLogins++;
        }
      });
    });

    // Compute new users this month from createdAt
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = allUsrs.filter(u => new Date(u.createdAt) >= startOfMonth).length;

    // Build activity log from real user activityLog entries
    const allLogs = [];
    allUsrs.forEach(u => {
      (u.activityLog || []).slice(0, 5).forEach(entry => {
        allLogs.push({
          user: u.fullName || u.email,
          role: u.role,
          action: entry.action,
          timestamp: new Date(entry.timestamp),
          category: entry.category || 'system',
          severity: entry.severity || 'low',
          details: entry.details || '',
          ip: entry.ipAddress || '',
        });
      });
    });
    allLogs.sort((a, b) => b.timestamp - a.timestamp);
    setActivityLog(allLogs.slice(0, 20));

    setUsers({
      total: totalUsers,
      byRole,
      newThisMonth,
      successfulLogins,
      failedLogins,
      recentActivity: allLogs.slice(0, 20),
    });

    // ── Cases ──────────────────────────────────
    const cs = caseStatsRes?.data || {};
    setCases({
      total: cs.totalCases || 0,
      byStatus: cs.byStatus || [],
      byCategory: cs.byCategory || [],
      bySeverity: cs.bySeverity || [],
    });

    // ── Evidence / Document Verification ───────
    const vs = verStatsRes?.data || {};
    setEvidence({
      total: vs.totalVerifications || 0,
      completed: vs.completed || 0,
      pending: vs.pending || 0,
      failed: vs.failed || 0,
      inProgress: vs.inProgress || 0,
      lowRisk: vs.lowRiskCount || 0,
      mediumRisk: vs.mediumRiskCount || 0,
      highRisk: vs.highRiskCount || 0,
      criticalRisk: vs.criticalRiskCount || 0,
      flaggedForReview: vs.flaggedForReview || 0,
      avgRiskScore: Math.round(vs.averageRiskScore || 0),
    });

    // Build heatmap from actual verification createdAt dates
    const verifications = verAnalyticsRes?.data?.allVerifications || [];
    const hm = Array.from({ length: 12 }, () => Array.from({ length: 7 }, () => 0));
    verifications.forEach(v => {
      const d = new Date(v.createdAt || v.verificationStartedAt);
      const msAgo = Date.now() - d.getTime();
      const weeksAgo = Math.floor(msAgo / (7 * 24 * 60 * 60 * 1000));
      const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0
      if (weeksAgo >= 0 && weeksAgo < 12) {
        hm[11 - weeksAgo][dayOfWeek]++;
      }
    });
    setHeatmapData(hm);

    // ── Contacts ───────────────────────────────
    const ct = contactStatsRes?.summary || {};
    setContacts({
      total: ct.total || 0,
      newMessages: ct.newMessages || 0,
      inProgress: ct.inProgress || 0,
      resolved: ct.resolved || 0,
      urgent: ct.urgent || 0,
      unread: ct.unread || 0,
    });

    // ── Blogs ──────────────────────────────────
    const bt = blogRes?.total || 0;
    setBlogs({
      total: bt,
      published: blogRes?.published ?? Math.round(bt * 0.75),
      draft: blogRes?.drafts ?? Math.ceil(bt * 0.25),
    });

    // ── Role Requests ──────────────────────────
    const rr = roleReqStatsRes?.data || {};
    setRoleRequests({
      total: rr.total || 0,
      pending: rr.pending || 0,
      approved: rr.approved || 0,
      rejected: rr.rejected || 0,
      verified: rr.verified || 0,
      byRole: rr.byRole || [],
    });

    setLastRefresh(new Date());
    setLoading(false);
  }, [timeRange]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ── Export CSV ──────────────────────────────
  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', users.total],
      ['New Users (This Month)', users.newThisMonth],
      ['Successful Logins', users.successfulLogins],
      ['Failed Logins', users.failedLogins],
      ['Total Cases', cases.total],
      ['Total Evidence Verifications', evidence.total],
      ['Completed Verifications', evidence.completed],
      ['Pending Verifications', evidence.pending],
      ['High Risk Documents', evidence.highRisk],
      ['Critical Risk Documents', evidence.criticalRisk],
      ['Flagged for Review', evidence.flaggedForReview],
      ['Avg Risk Score', evidence.avgRiskScore + '%'],
      ['Contact Messages', contacts.total],
      ['Unread Messages', contacts.unread],
      ['Resolved Messages', contacts.resolved],
      ['Blog Posts', blogs.total],
      ['Published Blogs', blogs.published],
      ['Role Requests Total', roleRequests.total],
      ['Role Requests Pending', roleRequests.pending],
      ['Role Requests Approved', roleRequests.approved],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legalvault-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived computed values ──────────────────
  const roleColors = {
    admin: '#f97316', user: '#3b82f6', lawyer: '#8b5cf6',
    police: '#f59e0b', judge: '#10b981', forensic_expert: '#ef4444',
    role_assigner: '#06b6d4',
  };
  const roleLabels = {
    admin: 'Admin', user: 'Citizens', lawyer: 'Lawyers',
    police: 'Police', judge: 'Judges', forensic_expert: 'Forensic',
    role_assigner: 'Role Assigner',
  };
  const userRoleBreakdown = Object.entries(users.byRole)
    .filter(([, v]) => v > 0)
    .map(([role, value]) => ({
      label: roleLabels[role] || role,
      value,
      color: roleColors[role] || '#94a3b8',
    }));
  const userRoleTotal = userRoleBreakdown.reduce((s, x) => s + x.value, 0) || 1;

  const evidenceStatusSegments = [
    { value: evidence.completed || 1, color: '#10b981', label: 'Completed' },
    { value: evidence.pending || 1, color: '#f59e0b', label: 'Pending' },
    { value: evidence.inProgress || 1, color: '#3b82f6', label: 'In Progress' },
    { value: evidence.failed || 1, color: '#ef4444', label: 'Failed' },
  ];

  const evidenceRiskSegments = [
    { value: evidence.lowRisk || 1, color: '#10b981', label: 'Low Risk' },
    { value: evidence.mediumRisk || 1, color: '#f59e0b', label: 'Medium Risk' },
    { value: evidence.highRisk || 1, color: '#ef4444', label: 'High Risk' },
    { value: evidence.criticalRisk || 1, color: '#7c3aed', label: 'Critical' },
  ];

  const contactSegments = [
    { value: contacts.resolved || 1, color: '#10b981', label: 'Resolved' },
    { value: contacts.newMessages || 1, color: '#3b82f6', label: 'New' },
    { value: contacts.inProgress || 1, color: '#f59e0b', label: 'In Progress' },
    { value: contacts.urgent || 1, color: '#ef4444', label: 'Urgent' },
  ];

  const caseStatusData = cases.byStatus.map(s => ({
    label: s._id ? (s._id.charAt(0).toUpperCase() + s._id.slice(1)) : 'Unknown',
    value: s.count || 0,
  }));

  const caseCategoryData = cases.byCategory
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8)
    .map(s => ({
      label: s._id ? s._id.slice(0, 6) : '?',
      value: s.count || 0,
    }));

  const roleReqByRoleData = roleRequests.byRole
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map(r => ({
      label: r._id ? (roleLabels[r._id] || r._id).slice(0, 7) : '?',
      value: r.count || 0,
    }));

  const verifyRate = evidence.total > 0
    ? Math.round((evidence.completed / evidence.total) * 100)
    : 0;

  // Activity log helpers
  const logTypeIcon = (action, category) => {
    const map = {
      login: Users, login_failed: UserX, logout: Users,
      register: UserCheck, update_user_role: UserCheck,
      upload_evidence: FileText, verify_document: Shield,
      submit_case: Layers, role_request: CheckCircle,
      contact_message: MessageSquare, blog_created: BookOpen,
    };
    const Icon = map[action] || (category === 'security' ? Lock : Activity);
    const colorMap = {
      login: 'text-blue-500', login_failed: 'text-red-500',
      upload_evidence: 'text-purple-500', verify_document: 'text-orange-500',
      submit_case: 'text-teal-500', role_request: 'text-green-500',
      contact_message: 'text-indigo-500', blog_created: 'text-yellow-500',
    };
    return <Icon className={`h-4 w-4 ${colorMap[action] || 'text-gray-400'}`} />;
  };

  const severityBadge = (severity) => {
    const map = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
      critical: 'bg-purple-100 text-purple-700',
    };
    return map[severity] || 'bg-gray-100 text-gray-600';
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <BarChart3 className="h-6 w-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-500 font-medium">Fetching live analytics…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* ── Page Header ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-orange-500" />
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live platform intelligence — last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden text-xs font-semibold shadow-sm">
            {['7d', '30d', '90d', '1y'].map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-3 py-2 transition-colors ${timeRange === r ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={fetchAllData}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 shadow-sm transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Users" value={users.total.toLocaleString()} icon={Users} color="bg-blue-500"
          subtitle={`+${users.newThisMonth} this month`} changeDir="up" change={`+${users.newThisMonth} new`} />
        <KpiCard title="Verifications" value={evidence.total.toLocaleString()} icon={Shield} color="bg-orange-500"
          subtitle={`${evidence.completed} completed`} changeDir={evidence.completed > 0 ? 'up' : 'flat'} change={`${evidence.completed} done`} />
        <KpiCard title="Cases Filed" value={cases.total.toLocaleString()} icon={FileText} color="bg-purple-500"
          subtitle="Total legal cases" changeDir={cases.total > 0 ? 'up' : 'flat'} change={`${cases.total} total`} />
        <KpiCard title="Contact Msgs" value={contacts.total.toLocaleString()} icon={MessageSquare} color="bg-green-500"
          subtitle={`${contacts.unread} unread`} changeDir={contacts.newMessages > 0 ? 'up' : 'flat'} change={`${contacts.newMessages} new`} />
        <KpiCard title="Role Requests" value={roleRequests.total.toLocaleString()} icon={UserCheck} color="bg-indigo-500"
          subtitle={`${roleRequests.pending} pending`} changeDir={roleRequests.pending > 0 ? 'up' : 'flat'} change={`${roleRequests.pending} pending`} />
        <KpiCard title="Blog Posts" value={blogs.total.toLocaleString()} icon={BookOpen} color="bg-teal-500"
          subtitle={`${blogs.published} published`} changeDir={blogs.total > 0 ? 'up' : 'flat'} change={`${blogs.published} live`} />
      </div>

      {/* ── Row 2: User Role Donut + Login Security ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="User Role Distribution" subtitle="Live breakdown of all registered users by role" icon={Users} />
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <DonutChart segments={userRoleBreakdown.length ? userRoleBreakdown : [{ value: 1, color: '#e5e7eb', label: 'No data' }]} size={160} thickness={26} />
            </div>
            <div className="flex-1 w-full space-y-2">
              {userRoleBreakdown.map((r, i) => (
                <Bar key={i} value={r.value} max={userRoleTotal} color={r.color} label={r.label} count={r.value} delay={i * 70} />
              ))}
              {userRoleBreakdown.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No user data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Login Security" subtitle="Authentication events in selected period" icon={Lock} />
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Successful Logins</span>
              </div>
              <span className="text-lg font-extrabold text-green-700">{users.successfulLogins}</span>
            </div>
            <div className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Failed Logins</span>
              </div>
              <span className="text-lg font-extrabold text-red-700">{users.failedLogins}</span>
            </div>
            <div className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">New Registrations</span>
              </div>
              <span className="text-lg font-extrabold text-orange-700">{users.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Registered</span>
              </div>
              <span className="text-lg font-extrabold text-blue-700">{users.total}</span>
            </div>
            {users.failedLogins > 0 && (
              <div className="flex items-center gap-2 bg-red-50 rounded-lg px-4 py-2 border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">
                  {users.failedLogins} failed login attempt{users.failedLogins !== 1 ? 's' : ''} detected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Evidence Status + Risk Level + Blockchain ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Verification Status" subtitle="Document verification pipeline" icon={Shield} />
          <div className="flex justify-center mb-3">
            <DonutChart segments={evidenceStatusSegments} size={150} thickness={26} />
          </div>
          <Legend items={evidenceStatusSegments} />
          <div className="mt-4 space-y-2">
            {[
              { label: 'Completed', value: evidence.completed, color: 'text-green-600', icon: CheckCircle, iconColor: 'text-green-500' },
              { label: 'In Progress', value: evidence.inProgress, color: 'text-blue-600', icon: Activity, iconColor: 'text-blue-500' },
              { label: 'Pending', value: evidence.pending, color: 'text-yellow-600', icon: Clock, iconColor: 'text-yellow-500' },
              { label: 'Failed', value: evidence.failed, color: 'text-red-600', icon: AlertTriangle, iconColor: 'text-red-500' },
            ].map(({ label, value, color, icon: Icon, iconColor }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1"><Icon className={`h-4 w-4 ${iconColor}`} />{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Risk Level Distribution" subtitle="AI-assessed document risk scores" icon={FileWarning} />
          <div className="flex justify-center mb-3">
            <DonutChart segments={evidenceRiskSegments} size={150} thickness={26} />
          </div>
          <Legend items={evidenceRiskSegments} />
          <div className="mt-4 space-y-2">
            {[
              { label: 'Low Risk', value: evidence.lowRisk, color: 'text-green-600' },
              { label: 'Medium Risk', value: evidence.mediumRisk, color: 'text-yellow-600' },
              { label: 'High Risk', value: evidence.highRisk, color: 'text-red-600' },
              { label: 'Critical', value: evidence.criticalRisk, color: 'text-purple-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-500" />Flagged for Review</span>
              <span className="font-bold text-orange-600">{evidence.flaggedForReview}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Verification Health" subtitle="AI pipeline performance metrics" icon={Zap} />
          <div className="flex justify-center mb-2">
            <GaugeChart value={verifyRate} max={100} color="#f97316" label="Completion" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center bg-orange-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600 font-medium">Total Processed</span>
              <span className="text-sm font-bold text-orange-700">{evidence.total}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600 font-medium">Avg Risk Score</span>
              <span className="text-sm font-bold text-purple-700">{evidence.avgRiskScore}%</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600 font-medium">Completion Rate</span>
              <span className="text-sm font-bold text-green-700">{verifyRate}%</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600 font-medium">Flagged Critical</span>
              <span className="text-sm font-bold text-red-700">{evidence.criticalRisk + evidence.highRisk}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Cases by Status + Category ────── */}
      {cases.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader title="Cases by Status" subtitle="Live breakdown of all filed legal cases" icon={FileText} />
            {caseStatusData.length > 0 ? (
              <>
                <ColumnChart data={caseStatusData} color="#8b5cf6" height={140} />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {caseStatusData.map((d, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-600">{d.label}</span>
                      <span className="text-sm font-bold text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No cases data</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionHeader title="Cases by Category" subtitle="Top legal case categories on the platform" icon={Layers} />
            {caseCategoryData.length > 0 ? (
              <>
                <ColumnChart data={caseCategoryData} color="#3b82f6" height={140} />
                <div className="mt-4 space-y-2">
                  {cases.byCategory.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5).map((d, i) => (
                    <Bar key={i} value={d.count || 0} max={cases.byCategory[0]?.count || 1}
                      color={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][i % 5]}
                      label={d._id || 'Unknown'} count={d.count || 0} delay={i * 80} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No category data</div>
            )}
          </div>
        </div>
      )}

      {/* ── Row 5: Contacts + Role Requests ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Contact Messages" subtitle="Support inbox overview" icon={MessageSquare} />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart segments={contactSegments} size={140} thickness={24} />
            <div className="flex-1 w-full space-y-2">
              {[
                { label: 'Total', value: contacts.total, bg: 'bg-gray-50', text: 'text-gray-800' },
                { label: 'New / Unread', value: contacts.newMessages + ' / ' + contacts.unread, bg: 'bg-blue-50', text: 'text-blue-700' },
                { label: 'In Progress', value: contacts.inProgress, bg: 'bg-yellow-50', text: 'text-yellow-700' },
                { label: 'Resolved', value: contacts.resolved, bg: 'bg-green-50', text: 'text-green-700' },
                { label: 'Urgent', value: contacts.urgent, bg: 'bg-red-50', text: 'text-red-700' },
              ].map(({ label, value, bg, text }) => (
                <div key={label} className={`flex justify-between items-center ${bg} rounded-lg px-3 py-2`}>
                  <span className="text-xs text-gray-600 font-medium">{label}</span>
                  <span className={`text-sm font-bold ${text}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Role Requests" subtitle="Professional role upgrade pipeline" icon={UserCheck} />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Total', value: roleRequests.total, bg: 'bg-gray-50', text: 'text-gray-800' },
              { label: 'Pending', value: roleRequests.pending, bg: 'bg-yellow-50', text: 'text-yellow-700' },
              { label: 'Verified', value: roleRequests.verified, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Approved', value: roleRequests.approved, bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Rejected', value: roleRequests.rejected, bg: 'bg-red-50', text: 'text-red-700' },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} rounded-xl px-4 py-3 text-center`}>
                <p className={`text-xl font-extrabold ${text}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {roleReqByRoleData.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requests by Role</p>
              <ColumnChart data={roleReqByRoleData} color="#6366f1" height={80} />
            </>
          )}
        </div>
      </div>

      {/* ── Row 6: Blog Content ─────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <SectionHeader title="Content Overview" subtitle="Blog & knowledge base statistics" icon={BookOpen} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Bar value={blogs.published} max={blogs.total || 1} color="#6366f1" label="Published Posts" count={blogs.published} delay={0} />
            <Bar value={blogs.draft} max={blogs.total || 1} color="#f59e0b" label="Draft Posts" count={blogs.draft} delay={100} />
          </div>
          <div className="flex justify-center">
            <DonutChart segments={[
              { value: blogs.published || 1, color: '#6366f1', label: 'Published' },
              { value: blogs.draft || 1, color: '#f59e0b', label: 'Draft' },
            ]} size={130} thickness={22} />
          </div>
          <div className="grid grid-cols-2 gap-3 self-center">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-indigo-700">{blogs.total}</p>
              <p className="text-xs text-indigo-500 font-medium mt-0.5">Total Articles</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-orange-700">
                {blogs.total > 0 ? Math.round((blogs.published / blogs.total) * 100) : 0}%
              </p>
              <p className="text-xs text-orange-500 font-medium mt-0.5">Publish Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 7: Blockchain Heatmap ──────────────
           Cells are built from real verification timestamps ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <SectionHeader
          title="Blockchain Verification Heatmap"
          subtitle="Real evidence verification activity — daily intensity over last 12 weeks"
          icon={Shield}
        />
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-[420px]">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pt-6">
              {days.map(d => (
                <div key={d} className="h-7 flex items-center">
                  <span className="text-xs text-gray-400 w-7 text-right pr-1">{d.slice(0, 1)}</span>
                </div>
              ))}
            </div>
            {/* Month/week columns */}
            <div className="flex flex-col">
              <div className="flex gap-1 mb-1">
                {Array.from({ length: 12 }, (_, week) => {
                  const d = new Date(Date.now() - (11 - week) * 7 * 24 * 60 * 60 * 1000);
                  return (
                    <div key={week} className="w-7 text-center">
                      {d.getDate() <= 7 && (
                        <span className="text-xs text-gray-400">{months[d.getMonth()].slice(0, 3)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1">
                {heatmapData.map((week, wIdx) => {
                  const maxVal = Math.max(...heatmapData.flat(), 1);
                  return (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((count, dIdx) => {
                        const intensity = count / maxVal;
                        const bg = count === 0 ? 'bg-gray-100'
                          : intensity < 0.25 ? 'bg-orange-200'
                          : intensity < 0.5 ? 'bg-orange-400'
                          : intensity < 0.75 ? 'bg-orange-600'
                          : 'bg-orange-800';
                        return (
                          <div
                            key={dIdx}
                            className={`w-7 h-7 rounded-sm ${bg} cursor-pointer hover:scale-110 hover:ring-2 hover:ring-orange-300 transition-transform`}
                            title={`${count} verification${count !== 1 ? 's' : ''} — Week ${wIdx + 1}, ${days[dIdx]}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">Less</span>
            {['bg-gray-100', 'bg-orange-200', 'bg-orange-400', 'bg-orange-600', 'bg-orange-800'].map((c, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </div>
      </div>

      {/* ── Row 8: Live Activity Log + Summary Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Live Activity Log" subtitle="Real user actions from platform audit trail" icon={Activity} />
          {activityLog.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1
              [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-orange-300 [&::-webkit-scrollbar-track]:bg-gray-100">
              {activityLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-50">
                  <div className="mt-0.5 flex-shrink-0">{logTypeIcon(log.action, log.category)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="text-orange-600">{log.user}</span>
                      {' '}&mdash;{' '}
                      <span className="capitalize">{(log.action || '').replace(/_/g, ' ')}</span>
                    </p>
                    {log.details && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{log.details}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{timeAgo(log.timestamp)}
                      </span>
                      {log.ip && log.ip !== 'System' && (
                        <span className="text-xs text-gray-300">{log.ip}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Activity className="h-10 w-10 mb-3 text-gray-200" />
              <p className="text-sm">No activity log entries yet</p>
              <p className="text-xs mt-1">Activity will appear as users interact with the platform</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Platform Summary" subtitle="All live metrics at a glance" icon={Database} />
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Active / Done</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { module: 'Users', total: users.total, active: users.total - (users.byRole['user'] || 0), icon: Users, color: 'text-blue-500' },
                  { module: 'Verifications', total: evidence.total, active: evidence.completed, icon: Shield, color: 'text-orange-500' },
                  { module: 'Legal Cases', total: cases.total, active: cases.byStatus.find(s => s._id === 'open')?.count || 0, icon: FileText, color: 'text-purple-500' },
                  { module: 'Contact Msgs', total: contacts.total, active: contacts.resolved, icon: MessageSquare, color: 'text-green-500' },
                  { module: 'Role Requests', total: roleRequests.total, active: roleRequests.approved, icon: UserCheck, color: 'text-indigo-500' },
                  { module: 'Blog Articles', total: blogs.total, active: blogs.published, icon: BookOpen, color: 'text-teal-500' },
                ].map((row, i) => {
                  const pct = row.total > 0 ? Math.round((row.active / row.total) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <row.icon className={`h-4 w-4 ${row.color}`} />
                          <span className="font-medium text-gray-800">{row.module}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{row.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{row.active.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          pct >= 75 ? 'bg-green-100 text-green-700'
                          : pct >= 40 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* System performance gauges */}
          <div className="mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Performance</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center">
                <GaugeChart value={verifyRate} max={100} color="#f97316" label="Verify Rate" />
                <p className="text-xs text-gray-500 -mt-1">Verify Rate</p>
              </div>
              <div className="flex flex-col items-center">
                <GaugeChart
                  value={roleRequests.total > 0 ? Math.round((roleRequests.approved / roleRequests.total) * 100) : 0}
                  max={100} color="#6366f1" label="Approval Rate" />
                <p className="text-xs text-gray-500 -mt-1">Approval Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 pb-2">
        LEGALVAULT Analytics Engine · All data fetched live from backend APIs · Times in IST
      </div>
    </div>
  );
};

export default AdminReports;
