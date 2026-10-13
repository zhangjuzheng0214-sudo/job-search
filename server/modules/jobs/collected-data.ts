export interface CollectedJobRaw {
  title: string;
  url: string;
  publish_time: string;
  deadline: string;
  position_count: number;
  has_attachment: boolean;
  body_len: number;
  snippet: string;
  positions: CollectedPosition[];
}

export interface CollectedPosition {
  position: string;
  major: string;
  education: string;
  count: number;
}

export const collectedJobs: CollectedJobRaw[] = [
  {
    title: '宁波市发展规划研究院公开招聘工作人员公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_4892fd4f28a44445b7dfe9690cc0e255.html',
    publish_time: '2026-07-29 15:39',
    deadline: '2026-08-14',
    position_count: 1,
    has_attachment: true,
    body_len: 3582,
    snippet:
      '宁波市发展规划研究院是宁波市发展和改革委员会所属公益二类事业单位，机构规格相当于副局级。因工作需要，面向社会公开招聘事业编制工作人员。报名时间：自公告发布之日起至2026年8月14日17时。报名方式：登录宁波市人事考试网上报名系统进行报名。',
    positions: [
      {
        position: '产业研究',
        major: '产业经济学（020205）、区域经济学（020202）、国民经济学（020201）',
        education: '硕士研究生及以上',
        count: 1,
      },
    ],
  },
  {
    title: '浙江大学软件学院（宁波）创新与管理中心高层次人才（教师）招聘公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_bb6a1581b0ef425b9171967497539ce7.html',
    publish_time: '2026-08-02 09:15',
    deadline: '2026-12-31',
    position_count: 19,
    has_attachment: true,
    body_len: 6820,
    snippet:
      '浙江大学软件学院（宁波）创新与管理中心面向全球公开招聘高层次人才（教师）19名。招聘方向包括软件工程、人工智能、大数据、网络空间安全等。报名截止至2026年12月31日，招满即止。',
    positions: [
      {
        position: '软件工程方向教师',
        major: '软件工程（0835）、计算机科学与技术（0812）',
        education: '博士研究生',
        count: 5,
      },
      {
        position: '人工智能方向教师',
        major: '人工智能、模式识别与智能系统（081104）、计算机应用技术（081203）',
        education: '博士研究生',
        count: 4,
      },
      {
        position: '大数据方向教师',
        major: '数据科学与大数据技术、计算机科学与技术（0812）',
        education: '博士研究生',
        count: 3,
      },
      {
        position: '网络空间安全方向教师',
        major: '网络空间安全（0839）、信息安全',
        education: '博士研究生',
        count: 3,
      },
      {
        position: '产品设计方向教师',
        major: '设计学（1305）、工业设计工程',
        education: '硕士研究生及以上',
        count: 2,
      },
      {
        position: '创新创业管理方向教师',
        major: '工商管理（1202）、管理科学与工程（1201）',
        education: '博士研究生',
        count: 2,
      },
    ],
  },
  {
    title: '宁波市教育局直属学校公开招聘事业编制教师公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_a45d41e9cf244bf38a140b27a4f63236.html',
    publish_time: '2026-06-15 10:30',
    deadline: '2026-07-16',
    position_count: 76,
    has_attachment: true,
    body_len: 8923,
    snippet:
      '宁波市教育局直属学校面向社会公开招聘事业编制教师76名，涉及语文、数学、英语、物理、化学、生物、历史、地理、政治、体育、音乐、美术、信息技术等学科。报名时间：2026年7月10日9:00至7月16日17:00。',
    positions: [
      {
        position: '高中语文教师',
        major: '汉语言文学（050101）、中国语言文学（0501）、学科教学（语文，045103）',
        education: '本科及以上',
        count: 8,
      },
      {
        position: '高中数学教师',
        major: '数学与应用数学（070101）、数学（0701）、学科教学（数学，045104）',
        education: '本科及以上',
        count: 8,
      },
      {
        position: '高中英语教师',
        major: '英语（050201）、外国语言文学（0502）、学科教学（英语，045108）',
        education: '本科及以上',
        count: 7,
      },
      {
        position: '高中物理教师',
        major: '物理学（0702）、学科教学（物理，045105）',
        education: '本科及以上',
        count: 6,
      },
      {
        position: '高中化学教师',
        major: '化学（0703）、学科教学（化学，045106）',
        education: '本科及以上',
        count: 5,
      },
      {
        position: '高中生物教师',
        major: '生物科学（071001）、生物学（0710）、学科教学（生物，045107）',
        education: '本科及以上',
        count: 5,
      },
      {
        position: '高中历史教师',
        major: '历史学（0601）、学科教学（历史，045109）',
        education: '本科及以上',
        count: 5,
      },
      {
        position: '高中地理教师',
        major: '地理科学（070501）、地理学（0705）、学科教学（地理，045110）',
        education: '本科及以上',
        count: 5,
      },
      {
        position: '高中政治教师',
        major: '思想政治教育（030503）、马克思主义理论（0305）、学科教学（思政，045102）',
        education: '本科及以上',
        count: 5,
      },
      {
        position: '体育教师',
        major: '体育教育（040201）、体育学（0403）、运动训练（040202K）',
        education: '本科及以上',
        count: 6,
      },
      {
        position: '音乐教师',
        major: '音乐学（130202）、音乐与舞蹈学（1302）、学科教学（音乐，045111）',
        education: '本科及以上',
        count: 4,
      },
      {
        position: '美术教师',
        major: '美术学（130401）、美术（135107）、绘画（130402）',
        education: '本科及以上',
        count: 4,
      },
      {
        position: '信息技术教师',
        major: '计算机科学与技术（080901）、软件工程（080902）、教育技术学（040104）',
        education: '本科及以上',
        count: 4,
      },
      {
        position: '心理健康教师',
        major: '心理学（0402）、应用心理学（040203）',
        education: '本科及以上',
        count: 4,
      },
    ],
  },
  {
    title: '宁波市气象局下属单位公开招聘高层次紧缺人才公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_14596c2f4ac54786adc770ca1d14316e.html',
    publish_time: '2026-06-25 14:00',
    deadline: '2026-07-20',
    position_count: 4,
    has_attachment: true,
    body_len: 4120,
    snippet:
      '宁波市气象局下属事业单位面向社会公开招聘高层次紧缺人才4名。报名时间：公告发布之日起至2026年7月20日17时。采取邮件报名方式。',
    positions: [
      {
        position: '气象预报岗',
        major: '大气科学（070601）、气象学（070601）',
        education: '硕士研究生及以上',
        count: 2,
      },
      {
        position: '气候与气候变化研究岗',
        major: '大气科学（0706）、气候学',
        education: '博士研究生',
        count: 1,
      },
      {
        position: '大气探测技术岗',
        major: '大气科学（0706）、电子信息工程（080701）',
        education: '硕士研究生及以上',
        count: 1,
      },
    ],
  },
  {
    title: '宁波中学公开招聘事业编制教师及工作人员公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_d21935ef4ed54aeda229755596801ae2.html',
    publish_time: '2026-06-20 16:45',
    deadline: '2026-07-15',
    position_count: 6,
    has_attachment: true,
    body_len: 5280,
    snippet:
      '宁波中学面向社会公开招聘事业编制教师及工作人员6名。报名时间：2026年7月1日9:00至7月15日17:00。报名方式：网上报名。',
    positions: [
      {
        position: '高中语文教师',
        major: '汉语言文学、中国语言文学（0501）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中数学教师',
        major: '数学（0701）、基础数学（070101）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中英语教师',
        major: '英语语言文学（050201）、外国语言学及应用语言学（050211）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中物理教师',
        major: '物理学（0702）、理论物理（070201）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中化学教师',
        major: '化学（0703）、有机化学（070303）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '校医',
        major: '临床医学（1002）、内科学（100201）',
        education: '本科及以上',
        count: 1,
      },
    ],
  },
  {
    title: '宁波市鄞州中学公开招聘事业编制教师的公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_b05915da0f3b4cd8abc7beaa42a170cf.html',
    publish_time: '2026-06-22 10:00',
    deadline: '2026-07-15',
    position_count: 1,
    has_attachment: true,
    body_len: 3200,
    snippet:
      '宁波市鄞州中学面向社会公开招聘事业编制教师1名。报名时间：2026年7月1日至7月15日。招聘岗位：高中通用技术教师。',
    positions: [
      {
        position: '高中通用技术教师',
        major: '通用技术、教育技术学（040104）、机械工程（0802）',
        education: '本科及以上',
        count: 1,
      },
    ],
  },
  {
    title: '宁波市效实中学公开招聘事业编制教师公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_c1ebd7f7fdfb468b96169239fb351216.html',
    publish_time: '2026-06-28 09:30',
    deadline: '2026-07-15',
    position_count: 4,
    has_attachment: true,
    body_len: 4560,
    snippet:
      '宁波市效实中学面向社会公开招聘事业编制教师4名。报名时间：2026年7月1日9:00至7月15日17:00。',
    positions: [
      {
        position: '高中语文教师',
        major: '汉语言文学（050101）、中国语言文学（0501）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中数学教师',
        major: '数学与应用数学（070101）、数学（0701）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '高中英语教师',
        major: '英语（050201）、翻译（050261）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '信息技术教师',
        major: '计算机科学与技术（080901）、软件工程（080902）',
        education: '硕士研究生及以上',
        count: 1,
      },
    ],
  },
  {
    title: '宁波市市场监督管理局局属事业单位宁波市药品检验所公开招聘高层次人才公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_2f0d44912f584835af4586d0dfeaddfb.html',
    publish_time: '2026-07-18 14:20',
    deadline: '2026-08-05',
    position_count: 1,
    has_attachment: true,
    body_len: 3850,
    snippet:
      '宁波市市场监督管理局局属事业单位宁波市药品检验所面向社会公开招聘高层次人才1名。报名时间：公告发布之日起至2026年8月5日。',
    positions: [
      {
        position: '药品检验研究岗',
        major: '药学（1007）、药物分析学（100704）、药理学（100706）',
        education: '博士研究生',
        count: 1,
      },
    ],
  },
  {
    title: '宁波市市场监督管理局局属事业单位宁波市特种设备检验研究院公开招聘高层次人才公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_638570d51b174a9d881df9f048548dba.html',
    publish_time: '2026-06-30 11:00',
    deadline: '2026-07-13',
    position_count: 1,
    has_attachment: true,
    body_len: 3650,
    snippet:
      '宁波市市场监督管理局局属事业单位宁波市特种设备检验研究院公开招聘高层次人才1名。报名时间：公告发布之日起至2026年7月13日。',
    positions: [
      {
        position: '特种设备检验研究岗',
        major: '机械工程（0802）、材料科学与工程（0805）、安全科学与工程（0837）',
        education: '博士研究生',
        count: 1,
      },
    ],
  },
  {
    title: '2026年宁波幼儿师范高等专科学校公开招聘高层次人才公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_a513a4b5376e4e9684f27d0ae0ce6072.html',
    publish_time: '2026-01-15 09:00',
    deadline: '',
    position_count: 28,
    has_attachment: true,
    body_len: 7680,
    snippet:
      '宁波幼儿师范高等专科学校面向社会公开招聘高层次人才28名。招聘岗位涵盖学前教育、初等教育、艺术教育、心理健康等方向。全年招聘，招满即止。',
    positions: [
      {
        position: '学前教育专业教师',
        major: '学前教育学（040105）、教育学（0401）',
        education: '博士研究生',
        count: 5,
      },
      {
        position: '初等教育专业教师',
        major: '小学教育（040107）、课程与教学论（040102）',
        education: '博士研究生',
        count: 4,
      },
      {
        position: '艺术教育专业教师',
        major: '音乐与舞蹈学（1302）、美术学（1304）、设计学（1305）',
        education: '硕士研究生及以上',
        count: 5,
      },
      {
        position: '心理健康教育教师',
        major: '心理学（0402）、发展与教育心理学（040202）',
        education: '硕士研究生及以上',
        count: 4,
      },
      {
        position: '体育教育教师',
        major: '体育学（0403）、体育教育训练学（040303）',
        education: '硕士研究生及以上',
        count: 3,
      },
      {
        position: '英语教师',
        major: '外国语言文学（0502）、英语语言文学（050201）',
        education: '硕士研究生及以上',
        count: 3,
      },
      {
        position: '计算机教师',
        major: '计算机科学与技术（0812）、教育技术学（040104）',
        education: '硕士研究生及以上',
        count: 2,
      },
      {
        position: '马克思主义理论教师',
        major: '马克思主义理论（0305）、思想政治教育（030503）',
        education: '硕士研究生及以上',
        count: 2,
      },
    ],
  },
  {
    title: '宁波市教育局教研室关于公开选聘教研员的公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_dc8b2100d9db473c95baa4317f4691be.html',
    publish_time: '2026-03-10 10:30',
    deadline: '',
    position_count: 0,
    has_attachment: true,
    body_len: 4100,
    snippet:
      '宁波市教育局教研室面向全市公开选聘教研员。选聘学科：语文、数学、英语、科学、历史与社会、道德与法治、体育与健康、艺术、综合实践活动。报名时间详见公告，采用单位推荐与个人自荐相结合方式。',
    positions: [
      {
        position: '语文教研员',
        major: '汉语言文学、中国语言文学（0501）',
        education: '本科及以上',
        count: 0,
      },
      {
        position: '数学教研员',
        major: '数学（0701）、基础数学（070101）',
        education: '本科及以上',
        count: 0,
      },
      {
        position: '英语教研员',
        major: '英语语言文学（050201）、外国语言学及应用语言学（050211）',
        education: '本科及以上',
        count: 0,
      },
    ],
  },
  {
    title: '浙江纺织服装职业技术学院公开招聘高层次高技能人才公告',
    url: 'http://rsj.ningbo.gov.cn/col/col1229676740/art/2026/art_7647114e00714e1ea338debac545b931.html',
    publish_time: '2026-02-20 14:00',
    deadline: '',
    position_count: 8,
    has_attachment: true,
    body_len: 5980,
    snippet:
      '浙江纺织服装职业技术学院面向社会公开招聘高层次高技能人才8名。招聘方向包括纺织工程、服装设计、艺术设计、时尚传播、数字媒体等。全年招聘，招满即止。',
    positions: [
      {
        position: '纺织工程方向教师',
        major: '纺织科学与工程（0821）、纺织工程（082101）',
        education: '博士研究生',
        count: 2,
      },
      {
        position: '服装设计方向教师',
        major: '设计学（1305）、服装设计与工程（082104）',
        education: '硕士研究生及以上',
        count: 2,
      },
      {
        position: '艺术设计方向教师',
        major: '设计学（1305）、美术学（1304）',
        education: '硕士研究生及以上',
        count: 2,
      },
      {
        position: '数字媒体方向教师',
        major: '数字媒体技术、计算机科学与技术（0812）、设计学（1305）',
        education: '硕士研究生及以上',
        count: 1,
      },
      {
        position: '时尚传播方向教师',
        major: '新闻传播学（0503）、设计学（1305）',
        education: '硕士研究生及以上',
        count: 1,
      },
    ],
  },
];

export function extractOrganization(title: string): string {
  const patterns = [
    /^(.+?(?:局|院|校|所|中心|研究院|检验研究院|药品检验所|气象局))/,
    /^(.+?(?:学校|中学|小学|幼儿园|大学|学院))/,
    /^(.+?(?:公司|集团|企业))/,
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1];
  }
  return title.slice(0, 12);
}
