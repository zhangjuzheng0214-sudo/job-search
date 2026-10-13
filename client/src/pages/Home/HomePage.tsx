import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Database } from 'lucide-react';
import JobFilter from './JobFilter';
import JobCard from './JobCard';
import { getJobList, getCrawlStatus, triggerCrawl } from '@client/src/api/jobs';
import type {
  JobItem,
  JobType,
  EducationLevel,
  JobListResponse,
} from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

const DEFAULT_PAGE_SIZE = 20;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [crawlStatus, setCrawlStatus] = useState<{
    isRunning: boolean;
    lastCrawlTime: string | null;
  }>({ isRunning: false, lastCrawlTime: null });
  const [refreshing, setRefreshing] = useState(false);

  const type = searchParams.get('type') as JobType | null;
  const province = searchParams.get('province');
  const city = searchParams.get('city');
  const myEducation = searchParams.get('myEducation') as EducationLevel | 'all' | null;
  const major = searchParams.get('major');
  const sortBy = (searchParams.get('sortBy') || 'deadline') as 'deadline' | 'recruitCount';
  const onlyHiring = searchParams.get('onlyHiring') !== 'false';
  const excludeRaw = searchParams.get('exclude');
  const publishDaysRaw = searchParams.get('publishDays');

  const excludeCategories = useMemo(
    () => (excludeRaw ? excludeRaw.split(',').filter(Boolean) : []),
    [excludeRaw],
  );

  const publishDays = publishDaysRaw ? Number(publishDaysRaw) : undefined;

  const updateParam = useCallback(
    (key: string, value: string | undefined | string[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','));
        } else {
          next.set(key, value);
        }
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        type: type || undefined,
        province: province || undefined,
        city: city || undefined,
        education:
          myEducation && myEducation !== 'all' ? (myEducation as EducationLevel) : undefined,
        major: major || undefined,
        sortBy,
        onlyHiring,
        publishDays,
        excludeCategories: excludeCategories.length > 0 ? excludeCategories : undefined,
      };
      const res: JobListResponse = await getJobList(params);
      setJobs(res.items);
      setTotal(res.total);
    } catch (err) {
      logger.error('加载岗位列表失败', err);
    } finally {
      setLoading(false);
    }
  }, [page, type, province, city, myEducation, major, sortBy, onlyHiring, publishDays, excludeCategories]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const fetchCrawlStatus = useCallback(async () => {
    try {
      const status = await getCrawlStatus();
      setCrawlStatus({
        isRunning: status.isRunning,
        lastCrawlTime: status.lastCrawlTime,
      });
    } catch (err) {
      logger.error('获取采集状态失败', err);
    }
  }, []);

  useEffect(() => {
    fetchCrawlStatus();
  }, [fetchCrawlStatus]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await triggerCrawl();
      toast.success('已触发数据刷新，请稍后查看');
      setTimeout(() => {
        fetchCrawlStatus();
        fetchJobs();
      }, 2000);
    } catch (err) {
      logger.error('刷新失败', err);
      toast.error('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastUpdate = (iso: string | null): string => {
    if (!iso) return '暂无';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '暂无';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hour}:${min}`;
  };

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="min-h-full" style={{ backgroundColor: '#f5f5f7' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight mb-1">
              全部岗位
            </h1>
            <p className="text-sm text-gray-500">
              共 <span className="font-medium text-gray-700">{total}</span> 条{' '}
              {onlyHiring && <>· 仅展示正在招聘</>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Database size={12} />
              <span>最后更新：{formatLastUpdate(crawlStatus.lastCrawlTime)}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || crawlStatus.isRunning}
              className="flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-[#0071e3] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                size={13}
                className={refreshing || crawlStatus.isRunning ? 'animate-spin' : ''}
              />
              {crawlStatus.isRunning ? '采集中…' : '刷新数据'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-5">
          <JobFilter
            type={type || undefined}
            province={province || undefined}
            city={city || undefined}
            myEducation={myEducation || 'all'}
            major={major || undefined}
            publishDays={publishDays}
            sortBy={sortBy}
            onlyHiring={onlyHiring}
            excludeCategories={excludeCategories}
            onTypeChange={(v) => updateParam('type', v)}
            onProvinceChange={(v) => updateParam('province', v)}
            onCityChange={(v) => updateParam('city', v)}
            onMyEducationChange={(v) => updateParam('myEducation', v ?? undefined)}
            onMajorChange={(v) => updateParam('major', v)}
            onPublishDaysChange={(d) => updateParam('publishDays', d ? String(d) : undefined)}
            onSortChange={(v) => updateParam('sortBy', v)}
            onOnlyHiringChange={(v) => updateParam('onlyHiring', v ? 'true' : 'false')}
            onExcludeCategoriesChange={(cats) => updateParam('exclude', cats)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200/60 h-32 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/60 py-20 text-center">
            <p className="text-gray-500 text-sm mb-1">暂无符合条件的岗位</p>
            <p className="text-gray-400 text-xs">试试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  highlightMajor={!!major}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 h-8 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-3 h-8 flex items-center text-xs text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 h-8 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
