import type { JobType } from '@shared/api.interface';

export type ParserType = 'jpaas-build-unit' | 'static-html';

export interface CrawlSource {
  name: string;
  type: JobType;
  parserType: ParserType;
  baseUrl: string;
  listApi: string;
  listParams: Record<string, string>;
  listUrlPattern?: string;
  listPageParam?: string;
  maxPages?: number;
  location: { province: string; city: string };
  sourceName: string;
  defaultOrganization: string;
}

export const CRAWL_SOURCES: CrawlSource[] = [
  {
    name: 'ningbo-rsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'http://rsj.ningbo.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'http://rsj.ningbo.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3500',
      tplSetId: 'Q8fiWxWOpjtBqvoDAoyaA',
      pageType: 'column',
      tagId: '宁波人社局2022_一般元数据列表',
      pageId: '1229676740',
      pageSize: '15',
      page: '1',
    },
    maxPages: 3,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '宁波市人力资源和社会保障局',
    defaultOrganization: '宁波市人力资源和社会保障局',
  },
  {
    name: 'ningbo-gzw',
    type: 'soe',
    parserType: 'jpaas-build-unit',
    listApi:
      'http://gzw.ningbo.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'http://gzw.ningbo.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3444',
      tplSetId: 'a31Z1cqlTfBs0h6JTUqNm',
      pageType: 'column',
      tagId: '当前栏目list',
      pageId: '1229671219',
      pageSize: '15',
      page: '1',
    },
    maxPages: 3,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '宁波市人民政府国有资产监督管理委员会',
    defaultOrganization: '宁波市人民政府国有资产监督管理委员会',
  },
  {
    name: 'ningbo-jyj-teacher',
    type: 'teacher',
    parserType: 'jpaas-build-unit',
    listApi:
      'http://jyj.ningbo.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'http://jyj.ningbo.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      editType: 'null',
      webId: '3505',
      tplSetId: 'nhl9SbNJKaVmh3cQqrL6J',
      pageType: 'column',
      tagId: '宁波市教育局_ajax列表',
      pageId: '1229166692',
      pageSize: '15',
      page: '1',
    },
    maxPages: 3,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '宁波市教育局',
    defaultOrganization: '宁波市教育局',
  },
  {
    name: 'haishu-rsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'https://www.haishu.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'https://www.haishu.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3595',
      tplSetId: 'a72zk0EROavXB1gzszbgx',
      pageType: 'column',
      tagId: '当前栏目list',
      pageId: '1229100797',
      pageSize: '15',
      page: '1',
    },
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '海曙区人力资源和社会保障局',
    defaultOrganization: '海曙区人力资源和社会保障局',
  },
  {
    name: 'zhenhai-wsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'https://www.zh.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'https://www.zh.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3428',
      tplSetId: 'sncjq09fJ0PtSd61FHyUB',
      pageType: 'column',
      tagId: '当前栏目列表1a',
      pageId: '1229830750',
      pageSize: '15',
      page: '1',
    },
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '镇海区卫生健康局',
    defaultOrganization: '镇海区卫生健康局',
  },
  {
    name: 'jiangbei-rsj',
    type: 'public-institution',
    parserType: 'static-html',
    listApi: 'DIRECT_HTML',
    baseUrl: 'https://www.nbjb.gov.cn',
    listUrlPattern: '/col/col1229105199/index.html',
    listPageParam: 'pageNo',
    listParams: {},
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '江北区人力资源和社会保障局',
    defaultOrganization: '江北区人力资源和社会保障局',
  },
  {
    name: 'xiangshan-rsj',
    type: 'public-institution',
    parserType: 'static-html',
    listApi: 'DIRECT_HTML',
    baseUrl: 'https://www.xiangshan.gov.cn',
    listUrlPattern: '/col/col1229680212/index.html',
    listPageParam: '',
    listParams: {},
    maxPages: 1,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '象山县人力资源和社会保障局',
    defaultOrganization: '象山县人力资源和社会保障局',
  },
  {
    name: 'yinzhou-rsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'http://www.nbyz.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'http://www.nbyz.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3597',
      tplSetId: 'y205MrmgOHxJgkKUsCYOb',
      pageType: 'column',
      tagId: '当前栏目list',
      pageId: '1229114448',
      pageSize: '15',
      page: '1',
    },
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '鄞州区人力资源和社会保障局',
    defaultOrganization: '鄞州区人力资源和社会保障局',
  },
  {
    name: 'fenghua-rsj',
    type: 'public-institution',
    parserType: 'static-html',
    listApi: 'DIRECT_HTML',
    baseUrl: 'https://www.fh.gov.cn',
    listUrlPattern: '/col/col1229105695/index.html',
    listPageParam: '',
    listParams: {},
    maxPages: 1,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '奉化区人力资源和社会保障局',
    defaultOrganization: '奉化区人力资源和社会保障局',
  },
  {
    name: 'yuyao-rsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'https://www.yy.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'https://www.yy.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3600',
      tplSetId: 'TUpQtEnErQ4EIvyi1QRgh',
      pageType: 'column',
      tagId: '组配分类list',
      pageId: '1229454673',
      pageSize: '20',
      page: '1',
    },
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '余姚市人力资源和社会保障局',
    defaultOrganization: '余姚市人力资源和社会保障局',
  },
  {
    name: 'beilun-rsj',
    type: 'public-institution',
    parserType: 'jpaas-build-unit',
    listApi:
      'https://www.bl.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit',
    baseUrl: 'https://www.bl.gov.cn',
    listParams: {
      parseType: 'bulidstatic',
      webId: '3499',
      tplSetId: 'iIEzq5wa84hjU6xuCoM3q',
      pageType: 'column',
      tagId: '组配分类list',
      pageId: '1229055243',
      pageSize: '20',
      page: '1',
    },
    maxPages: 2,
    location: { province: '浙江', city: '宁波市' },
    sourceName: '北仑区人力资源和社会保障局',
    defaultOrganization: '北仑区人力资源和社会保障局',
  },
];
