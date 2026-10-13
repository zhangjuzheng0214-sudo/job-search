import { useEffect, useState } from 'react';
import { Input } from '@client/src/components/ui/input';
import { Checkbox } from '@client/src/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  JOB_TYPE_LABELS,
  MY_EDUCATION_OPTIONS,
  JOB_CATEGORIES,
  type JobType,
  type EducationLevel,
} from '@shared/api.interface';
import { getProvinces, getCities } from '@client/src/api/jobs';
import { ArrowUpDown, BookOpen, Clock, Ban } from 'lucide-react';

interface JobFilterProps {
  type?: JobType;
  province?: string;
  city?: string;
  myEducation?: EducationLevel | 'all';
  major?: string;
  publishDays?: number;
  sortBy: 'deadline' | 'recruitCount';
  onlyHiring: boolean;
  excludeCategories: string[];
  onTypeChange: (type: JobType | undefined) => void;
  onProvinceChange: (province: string | undefined) => void;
  onCityChange: (city: string | undefined) => void;
  onMyEducationChange: (edu: EducationLevel | 'all' | undefined) => void;
  onMajorChange: (major: string | undefined) => void;
  onPublishDaysChange: (days: number | undefined) => void;
  onSortChange: (sort: 'deadline' | 'recruitCount') => void;
  onOnlyHiringChange: (onlyHiring: boolean) => void;
  onExcludeCategoriesChange: (cats: string[]) => void;
}

const PUBLISH_DAYS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: '今天', value: 1 },
  { label: '近3天', value: 3 },
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '全部', value: undefined },
];

const TYPE_TABS: { label: string; value: JobType | undefined }[] = [
  { label: '全部', value: undefined },
  { label: '公务员', value: 'civil' },
  { label: '事业单位', value: 'public-institution' },
  { label: '教师', value: 'teacher' },
  { label: '央企国企', value: 'soe' },
  { label: '劳务派遣/外包', value: 'labor-dispatch' },
];

const JobFilter = ({
  type,
  province,
  city,
  myEducation,
  major,
  publishDays,
  sortBy,
  onlyHiring,
  excludeCategories,
  onTypeChange,
  onProvinceChange,
  onCityChange,
  onMyEducationChange,
  onMajorChange,
  onPublishDaysChange,
  onSortChange,
  onOnlyHiringChange,
  onExcludeCategoriesChange,
}: JobFilterProps) => {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [majorInput, setMajorInput] = useState(major ?? '');

  useEffect(() => {
    setMajorInput(major ?? '');
  }, [major]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onMajorChange(majorInput.trim() || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [majorInput, onMajorChange]);

  useEffect(() => {
    let cancelled = false;
    getProvinces()
      .then((list) => {
        if (!cancelled) setProvinces(list);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!province) {
      setCities([]);
      return;
    }
    let cancelled = false;
    getCities(province)
      .then((list) => {
        if (!cancelled) setCities(list);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [province]);

  const handleProvinceChange = (val: string) => {
    const next = val || undefined;
    onProvinceChange(next);
    onCityChange(undefined);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Type tabs */}
      <div className="border-b border-gray-100 px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {TYPE_TABS.map((tab) => {
            const isActive = tab.value === type;
            return (
              <button
                key={tab.label}
                onClick={() => onTypeChange(tab.value)}
                className={`relative shrink-0 px-4 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#0071e3]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0071e3] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced filter row */}
      <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Province */}
          <Select
            value={province ?? ''}
            onValueChange={handleProvinceChange}
          >
            <SelectTrigger className="w-[110px] rounded-xl h-10">
              <SelectValue placeholder="省份" />
            </SelectTrigger>
            <SelectContent>
              {provinces.length === 0 ? (
                <SelectItem value="__loading__" disabled>
                  加载中...
                </SelectItem>
              ) : (
                provinces.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* City */}
          <Select
            value={city ?? ''}
            onValueChange={(v) => onCityChange(v || undefined)}
          >
            <SelectTrigger className="w-[110px] rounded-xl h-10">
              <SelectValue placeholder={province ? '城市' : '请先选省份'} />
            </SelectTrigger>
            <SelectContent>
              {!province ? (
                <SelectItem value="__none__" disabled>
                  请先选择省份
                </SelectItem>
              ) : cities.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  暂无城市数据
                </SelectItem>
              ) : (
                cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Education */}
          <div className="flex items-center gap-2">
            <Select
              value={myEducation ?? 'all'}
              onValueChange={(v) =>
                onMyEducationChange(v === 'all' ? undefined : (v as EducationLevel))
              }
            >
              <SelectTrigger className="w-[130px] rounded-xl h-10">
                <SelectValue placeholder="我的学历" />
              </SelectTrigger>
              <SelectContent>
                {MY_EDUCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-400 hidden sm:inline">
              我的学历
            </span>
          </div>

          {/* Publish days */}
          <Select
            value={publishDays?.toString() ?? ''}
            onValueChange={(v) => {
              const num = v ? Number(v) : undefined;
              onPublishDaysChange(num);
            }}
          >
            <SelectTrigger className="w-[110px] rounded-xl h-10">
              <SelectValue placeholder="发布时间" />
            </SelectTrigger>
            <SelectContent>
              {PUBLISH_DAYS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.label}
                  value={opt.value?.toString() ?? ''}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Major keyword */}
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <BookOpen
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              value={majorInput}
              onChange={(e) => setMajorInput(e.target.value)}
              placeholder="专业关键词（空格分隔，任一命中）"
              className="pl-8 h-10 text-sm rounded-xl"
            />
          </div>

          {/* Exclude categories */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-medium transition-colors ${
                  excludeCategories.length > 0
                    ? 'border-[#0071e3] text-[#0071e3] bg-blue-50'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >
                <Ban size={14} />
                <span>
                  不看
                  {excludeCategories.length > 0 && (
                    <span className="ml-1">({excludeCategories.length})</span>
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="text-xs text-gray-500 px-2 py-1.5 border-b border-gray-100 mb-1">
                选择要排除的岗位类别（可多选）
              </div>
              <div className="max-h-64 overflow-y-auto">
                {JOB_CATEGORIES.map((cat) => {
                  const checked = excludeCategories.includes(cat);
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (checked) {
                          onExcludeCategoriesChange(
                            excludeCategories.filter((c) => c !== cat),
                          );
                        } else {
                          onExcludeCategoriesChange([...excludeCategories, cat]);
                        }
                      }}
                    >
                      <Checkbox checked={checked} />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </div>
                  );
                })}
              </div>
              {excludeCategories.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <button
                    onClick={() => onExcludeCategoriesChange([])}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                  >
                    清空全部
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort + only hiring toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOnlyHiringChange(!onlyHiring)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              onlyHiring ? 'text-[#0071e3]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={14} />
            <span
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                onlyHiring ? 'bg-[#0071e3]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  onlyHiring ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </span>
            只看正在招聘
          </button>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">排序：</span>
            <div className="flex text-xs border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button
                onClick={() => onSortChange('deadline')}
                className={`px-3 py-1.5 transition-colors ${
                  sortBy === 'deadline'
                    ? 'bg-white text-[#0071e3] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                按截止时间
              </button>
              <button
                onClick={() => onSortChange('recruitCount')}
                className={`px-3 py-1.5 transition-colors ${
                  sortBy === 'recruitCount'
                    ? 'bg-white text-[#0071e3] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                按招聘人数
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilter;
