'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import {
  Users, TrendingUp, DollarSign, Activity, LogOut, Shield,
  Search, RefreshCw, ChevronLeft, ChevronRight, Package,
  Bell, CheckCircle, XCircle, AlertCircle, Eye, Ban,
  UserCheck, Layers, ArrowUpRight, ArrowDownLeft, BarChart3,
  Send, ToggleLeft, ToggleRight, Edit3, Trash2, Home,
  CreditCard, Clock,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Badge({ text, color }: { text: string; color: string }) {
  const map: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[color] || map.gray}`}>{text}</span>;
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Pagination({ page, total, limit, onChange }: any) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">Page {page} of {pages} ({total} total)</p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

type AdminTab = 'overview' | 'users' | 'investments' | 'transactions' | 'packages' | 'notifications';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');

  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const [investments, setInvestments] = useState<any[]>([]);
  const [investTotal, setInvestTotal] = useState(0);
  const [investPage, setInvestPage] = useState(1);
  const [investStatus, setInvestStatus] = useState('');
  const [investLoading, setInvestLoading] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txType, setTxType] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  const [packages, setPackages] = useState<any[]>([]);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [editPkg, setEditPkg] = useState<any>(null);

  const [notifyAll, setNotifyAll] = useState(true);
  const [notifyUserId, setNotifyUserId] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyType, setNotifyType] = useState('system');
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState('');

  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const authHeaders = () => {
    const tok = localStorage.getItem('si_token');
    return { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch('/api/admin/stats', { headers: authHeaders() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setStats(d);
    } catch (e: any) { showToast(e.message); }
    finally { setStatsLoading(false); }
  }, []);

  const loadUsers = useCallback(async (pg = userPage, search = userSearch) => {
    setUsersLoading(true);
    try {
      const r = await fetch(`/api/admin/users?page=${pg}&limit=20&search=${encodeURIComponent(search)}`, { headers: authHeaders() });
      const d = await r.json();
      setUsers(d.users || []);
      setUserTotal(d.total || 0);
    } catch (e: any) { showToast(e.message); }
    finally { setUsersLoading(false); }
  }, [userPage, userSearch]);

  const loadInvestments = useCallback(async (pg = investPage, status = investStatus) => {
    setInvestLoading(true);
    try {
      const r = await fetch(`/api/admin/investments?page=${pg}&limit=20&status=${status}`, { headers: authHeaders() });
      const d = await r.json();
      setInvestments(d.investments || []);
      setInvestTotal(d.total || 0);
    } catch (e: any) { showToast(e.message); }
    finally { setInvestLoading(false); }
  }, [investPage, investStatus]);

  const loadTransactions = useCallback(async (pg = txPage, type = txType, status = txStatus) => {
    setTxLoading(true);
    try {
      const r = await fetch(`/api/admin/transactions?page=${pg}&limit=20&type=${type}&status=${status}`, { headers: authHeaders() });
      const d = await r.json();
      setTransactions(d.transactions || []);
      setTxTotal(d.total || 0);
    } catch (e: any) { showToast(e.message); }
    finally { setTxLoading(false); }
  }, [txPage, txType, txStatus]);

  const loadPackages = useCallback(async () => {
    setPkgLoading(true);
    try {
      const r = await fetch('/api/admin/packages', { headers: authHeaders() });
      const d = await r.json();
      setPackages(d.packages || []);
    } catch (e: any) { showToast(e.message); }
    finally { setPkgLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'overview') loadStats(); }, [tab]);
  useEffect(() => { if (tab === 'users') loadUsers(userPage, userSearch); }, [tab, userPage]);
  useEffect(() => { if (tab === 'investments') loadInvestments(investPage, investStatus); }, [tab, investPage, investStatus]);
  useEffect(() => { if (tab === 'transactions') loadTransactions(txPage, txType, txStatus); }, [tab, txPage, txType, txStatus]);
  useEffect(() => { if (tab === 'packages') loadPackages(); }, [tab]);

  const loadUserDetail = async (id: string) => {
    setSelectedUser(id);
    setUserDetailLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${id}`, { headers: authHeaders() });
      const d = await r.json();
      setUserDetail(d);
    } catch (e: any) { showToast(e.message); }
    finally { setUserDetailLoading(false); }
  };

  const patchUser = async (id: string, data: any) => {
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      showToast('User updated');
      loadUsers(userPage, userSearch);
      if (selectedUser === id) loadUserDetail(id);
    } catch (e: any) { showToast(e.message); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      showToast('User deleted');
      setSelectedUser(null);
      setUserDetail(null);
      loadUsers(userPage, userSearch);
    } catch (e: any) { showToast(e.message); }
  };

  const patchTx = async (transactionId: string, action: string) => {
    try {
      const r = await fetch('/api/admin/transactions', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ transactionId, action }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      showToast('Transaction updated');
      loadTransactions(txPage, txType, txStatus);
    } catch (e: any) { showToast(e.message); }
  };

  const patchPkg = async (packageId: string, data: any) => {
    try {
      const r = await fetch('/api/admin/packages', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ packageId, ...data }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      showToast('Package updated');
      setEditPkg(null);
      loadPackages();
    } catch (e: any) { showToast(e.message); }
  };

  const sendNotification = async () => {
    if (!notifyTitle || !notifyMsg) { showToast('Title and message required'); return; }
    setNotifySending(true);
    try {
      const body: any = { title: notifyTitle, message: notifyMsg, type: notifyType };
      if (!notifyAll && notifyUserId) body.userId = notifyUserId;
      const r = await fetch('/api/admin/notify', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setNotifyResult(`Sent to ${d.sent} user${d.sent !== 1 ? 's' : ''}`);
      setNotifyTitle(''); setNotifyMsg('');
      setTimeout(() => setNotifyResult(''), 4000);
    } catch (e: any) { showToast(e.message); }
    finally { setNotifySending(false); }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!user?.is_admin) return null;

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">{toast}</div>
      )}

      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col min-h-screen shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SmartInvest</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 text-xs text-gray-400">Logged in as</div>
          <div className="px-3 py-1 text-xs font-medium text-gray-700">{user.username}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <ArrowUpRight className="w-4 h-4" />
            User Dashboard
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {tab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Platform-wide statistics</p>
                </div>
                <button onClick={loadStats} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              {statsLoading && !stats ? (
                <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" sub={`${stats.activeUsers} active`} />
                    <StatCard label="Total Balance" value={fmt(stats.totalBalance)} icon={DollarSign} color="green" sub="All user wallets" />
                    <StatCard label="Active Investments" value={stats.activeInvestments} icon={TrendingUp} color="purple" sub={`${stats.totalInvestments} total`} />
                    <StatCard label="Total Invested" value={fmt(stats.totalInvested)} icon={BarChart3} color="orange" />
                    <StatCard label="Total Paid Out" value={fmt(stats.totalPaidOut)} icon={ArrowDownLeft} color="teal" sub="Daily returns" />
                    <StatCard label="Total Earnings" value={fmt(stats.totalEarnings)} icon={Activity} color="green" sub="User earnings" />
                    <StatCard label="Total Transactions" value={stats.totalTransactions} icon={CreditCard} color="blue" />
                    <StatCard label="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Clock} color="red" sub="Needs action" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
                      <div className="space-y-3">
                        {(stats.recentUsers || []).map((u: any) => (
                          <div key={u._id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{u.username}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{fmt(u.balance)}</span>
                              <Badge text={u.is_active ? 'Active' : 'Suspended'} color={u.is_active ? 'green' : 'red'} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                      <div className="space-y-3">
                        {(stats.recentTransactions || []).map((tx: any) => (
                          <div key={tx._id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800 capitalize">{tx.type.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-400">{tx.user_id?.username || 'Unknown'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">{fmt(tx.amount)}</p>
                              <Badge text={tx.status} color={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{userTotal} total users</p>
                </div>
                <button onClick={() => loadUsers(userPage, userSearch)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="Search by username or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { setUserPage(1); loadUsers(1, userSearch); } }}
                  />
                </div>
                <button onClick={() => { setUserPage(1); loadUsers(1, userSearch); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Search</button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Balance</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>
                      ) : users.map(u => (
                        <tr key={u._id} className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${selectedUser === u._id ? 'bg-red-50' : ''}`} onClick={() => loadUserDetail(u._id)}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{u.username}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{fmt(u.balance)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              <Badge text={u.is_active ? 'Active' : 'Suspended'} color={u.is_active ? 'green' : 'red'} />
                              {u.is_admin && <Badge text="Admin" color="purple" />}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button title={u.is_active ? 'Suspend' : 'Activate'} onClick={e => { e.stopPropagation(); patchUser(u._id, { is_active: !u.is_active }); }} className="p-1.5 rounded hover:bg-gray-100">
                                {u.is_active ? <Ban className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                              </button>
                              <button title="Delete" onClick={e => { e.stopPropagation(); deleteUser(u._id); }} className="p-1.5 rounded hover:bg-gray-100">
                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4">
                    <Pagination page={userPage} total={userTotal} limit={20} onChange={(p: number) => { setUserPage(p); loadUsers(p, userSearch); }} />
                  </div>
                </div>
                {selectedUser && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    {userDetailLoading ? (
                      <div className="flex items-center justify-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : userDetail ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">User Detail</h3>
                          <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          {[
                            ['Username', userDetail.user?.username],
                            ['Email', userDetail.user?.email],
                            ['Balance', fmt(userDetail.user?.balance)],
                            ['Total Earned', fmt(userDetail.user?.total_earnings)],
                            ['Referral Earnings', fmt(userDetail.user?.referral_earnings)],
                            ['Referral Code', userDetail.user?.referral_code],
                            ['Joined', fmtDate(userDetail.user?.created_at)],
                            ['Phone', userDetail.user?.phone || '—'],
                            ['Gender', userDetail.user?.gender || '—'],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-gray-500">{k}</span>
                              <span className="font-medium text-gray-800 text-right max-w-[55%] break-all">{v as string}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 flex-wrap mb-4">
                          <button
                            onClick={() => patchUser(userDetail.user._id, { is_active: !userDetail.user.is_active })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${userDetail.user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {userDetail.user.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => patchUser(userDetail.user._id, { is_admin: !userDetail.user.is_admin })}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100"
                          >
                            {userDetail.user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="number"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                            placeholder="Adjust balance (±)"
                            id="balanceAdj"
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById('balanceAdj') as HTMLInputElement;
                              const val = parseFloat(el.value);
                              if (!isNaN(val)) patchUser(userDetail.user._id, { balance: (userDetail.user.balance || 0) + val });
                              el.value = '';
                            }}
                            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700"
                          >
                            Apply
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Recent Transactions</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(userDetail.transactions || []).map((tx: any) => (
                              <div key={tx._id} className="flex justify-between text-xs">
                                <span className="text-gray-600 capitalize">{tx.type.replace('_', ' ')}</span>
                                <span className="font-medium">{fmt(tx.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'investments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{investTotal} total</p>
                </div>
                <button onClick={() => loadInvestments(investPage, investStatus)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className={`w-4 h-4 ${investLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                {['', 'active', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => { setInvestStatus(s); setInvestPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm border ${investStatus === s ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Package</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Earned</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investLoading ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>
                    ) : investments.map(inv => (
                      <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{inv.user_id?.username || '—'}</p>
                          <p className="text-xs text-gray-400">{inv.user_id?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{inv.package_name}</td>
                        <td className="px-4 py-3 text-gray-700">{fmt(inv.amount)}</td>
                        <td className="px-4 py-3 text-green-600">{fmt(inv.total_earned)}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.days_completed}/{inv.duration_days}d</td>
                        <td className="px-4 py-3">
                          <Badge text={inv.status} color={inv.status === 'active' ? 'green' : inv.status === 'completed' ? 'blue' : 'red'} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(inv.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4">
                  <Pagination page={investPage} total={investTotal} limit={20} onChange={(p: number) => { setInvestPage(p); }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'transactions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{txTotal} total</p>
                </div>
                <button onClick={() => loadTransactions(txPage, txType, txStatus)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className={`w-4 h-4 ${txLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex gap-1">
                  {['', 'deposit', 'withdrawal', 'investment', 'daily_return', 'referral_bonus'].map(t => (
                    <button key={t} onClick={() => { setTxType(t); setTxPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs border ${txType === t ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {t || 'All Types'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {['', 'pending', 'completed', 'failed'].map(s => (
                    <button key={s} onClick={() => { setTxStatus(s); setTxPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs border ${txStatus === s ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {s || 'All Status'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txLoading ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>
                    ) : transactions.map(tx => (
                      <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{tx.user_id?.username || '—'}</p>
                          <p className="text-xs text-gray-400">{tx.user_id?.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-700">{tx.type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{fmt(tx.amount)}</td>
                        <td className="px-4 py-3">
                          <Badge text={tx.status} color={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{tx.description}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(tx.created_at)}</td>
                        <td className="px-4 py-3">
                          {tx.type === 'withdrawal' && tx.status === 'pending' && (
                            <div className="flex gap-1">
                              <button onClick={() => patchTx(tx._id, 'approve_withdrawal')} title="Approve" className="p-1.5 rounded bg-green-50 hover:bg-green-100">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                              <button onClick={() => patchTx(tx._id, 'reject_withdrawal')} title="Reject & refund" className="p-1.5 rounded bg-red-50 hover:bg-red-100">
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4">
                  <Pagination page={txPage} total={txTotal} limit={20} onChange={(p: number) => setTxPage(p)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'packages' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Investment Packages</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{packages.length} packages</p>
                </div>
                <button onClick={loadPackages} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className={`w-4 h-4 ${pkgLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Tier</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Daily %</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Total ROI</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkgLoading ? (
                      <tr><td colSpan={8} className="text-center py-10 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin inline" /></td></tr>
                    ) : packages.map(pkg => (
                      <tr key={pkg._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{pkg.name}</td>
                        <td className="px-4 py-3 capitalize text-gray-600">{pkg.tier}</td>
                        <td className="px-4 py-3 text-gray-700">{fmt(pkg.price)}</td>
                        <td className="px-4 py-3 text-gray-700">{pkg.daily_return_pct}%</td>
                        <td className="px-4 py-3 text-gray-700">{pkg.duration_days}d</td>
                        <td className="px-4 py-3 text-gray-700">{pkg.total_roi}%</td>
                        <td className="px-4 py-3">
                          <Badge text={pkg.is_active ? 'Active' : 'Disabled'} color={pkg.is_active ? 'green' : 'gray'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => patchPkg(pkg._id, { is_active: !pkg.is_active })} title={pkg.is_active ? 'Disable' : 'Enable'} className="p-1.5 rounded hover:bg-gray-100">
                              {pkg.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                            </button>
                            <button onClick={() => setEditPkg(pkg)} title="Edit" className="p-1.5 rounded hover:bg-gray-100">
                              <Edit3 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editPkg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Edit Package</h3>
                      <button onClick={() => setEditPkg(null)}><XCircle className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Name', key: 'name', type: 'text' },
                        { label: 'Price (₦)', key: 'price', type: 'number' },
                        { label: 'Daily Return %', key: 'daily_return_pct', type: 'number' },
                        { label: 'Duration (days)', key: 'duration_days', type: 'number' },
                        { label: 'Total ROI %', key: 'total_roi', type: 'number' },
                        { label: 'Tier', key: 'tier', type: 'text' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                          <input
                            type={type}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            value={editPkg[key]}
                            onChange={e => setEditPkg({ ...editPkg, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEditPkg(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                      <button onClick={() => patchPkg(editPkg._id, { name: editPkg.name, price: editPkg.price, daily_return_pct: editPkg.daily_return_pct, duration_days: editPkg.duration_days, total_roi: editPkg.total_roi, tier: editPkg.tier })} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Send Notifications</h1>
                <p className="text-sm text-gray-500 mt-0.5">Broadcast messages to users</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setNotifyAll(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${notifyAll ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                    All Users
                  </button>
                  <button onClick={() => setNotifyAll(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${!notifyAll ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                    Specific User
                  </button>
                </div>
                {!notifyAll && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 mb-1 block">User ID</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="MongoDB User ID"
                      value={notifyUserId}
                      onChange={e => setNotifyUserId(e.target.value)}
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    value={notifyType}
                    onChange={e => setNotifyType(e.target.value)}
                  >
                    {['system', 'info', 'deposit', 'withdrawal', 'investment', 'referral'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Title</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="Notification title"
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Message</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                    placeholder="Notification message..."
                    value={notifyMsg}
                    onChange={e => setNotifyMsg(e.target.value)}
                  />
                </div>
                {notifyResult && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    {notifyResult}
                  </div>
                )}
                <button
                  onClick={sendNotification}
                  disabled={notifySending}
                  className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {notifySending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {notifySending ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
