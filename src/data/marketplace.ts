export type AvailabilityStatus = 'available' | 'limited' | 'product-dependent' | 'not-available' | 'unknown';

export type Country = { code:string; name:string; flag:string; currency:string; currencySymbol:string; region:'West Africa'|'East Africa'|'Southern Africa'|'North Africa'|'Central Africa' };
export type Merchant = { slug:string; name:string; tagline:string; icon:string; type:string; countries:Record<string, AvailabilityStatus> };
export type MerchantOffer = { merchant:string; price:number; oldPrice?:number; currency:string; status:AvailabilityStatus; deliveryNote?:string; affiliateUrl?:string; affiliateId?:string };
export type Product = {
  slug:string; name:string; category:string; brand:string; icon:string; price:number; oldPrice?:number; rating:number; reviews:number; merchant:string; discount?:number;
  description:string; tags:string[]; offers?:MerchantOffer[]; affiliateId?:string;
};

export const countries:Country[] = [
 {code:'NG',name:'Nigeria',flag:'🇳🇬',currency:'NGN',currencySymbol:'₦',region:'West Africa'},
 {code:'GH',name:'Ghana',flag:'🇬🇭',currency:'GHS',currencySymbol:'GH₵',region:'West Africa'},
 {code:'KE',name:'Kenya',flag:'🇰🇪',currency:'KES',currencySymbol:'KSh',region:'East Africa'},
 {code:'EG',name:'Egypt',flag:'🇪🇬',currency:'EGP',currencySymbol:'E£',region:'North Africa'},
 {code:'MA',name:'Morocco',flag:'🇲🇦',currency:'MAD',currencySymbol:'MAD',region:'North Africa'},
 {code:'UG',name:'Uganda',flag:'🇺🇬',currency:'UGX',currencySymbol:'USh',region:'East Africa'},
 {code:'SN',name:'Senegal',flag:'🇸🇳',currency:'XOF',currencySymbol:'CFA',region:'West Africa'},
 {code:'CI',name:"Côte d’Ivoire",flag:'🇨🇮',currency:'XOF',currencySymbol:'CFA',region:'West Africa'},
];

export const merchants:Merchant[] = [
 {slug:'amazon',name:'Amazon',tagline:'Global products',icon:'a',type:'amazon',countries:{NG:'product-dependent',GH:'product-dependent',KE:'product-dependent',ZA:'available',EG:'available',MA:'product-dependent',UG:'product-dependent',SN:'product-dependent',CI:'product-dependent'}},
 {slug:'jumia',name:'JUMIA',tagline:"Africa's marketplace",icon:'✦',type:'jumia',countries:{NG:'available',GH:'available',KE:'available',ZA:'not-available',EG:'available',MA:'available',UG:'available',SN:'available',CI:'available'}},
 {slug:'aliexpress',name:'AliExpress',tagline:'Global deals',icon:'AE',type:'ali',countries:{NG:'product-dependent',GH:'product-dependent',KE:'product-dependent',ZA:'product-dependent',EG:'product-dependent',MA:'product-dependent',UG:'product-dependent',SN:'product-dependent',CI:'product-dependent'}},
 {slug:'ebay',name:'eBay',tagline:'Unique finds',icon:'e',type:'ebay',countries:{NG:'product-dependent',GH:'product-dependent',KE:'product-dependent',ZA:'product-dependent',EG:'product-dependent',MA:'product-dependent',UG:'product-dependent',SN:'product-dependent',CI:'product-dependent'}},
 {slug:'temu',name:'TEMU',tagline:'Big savings',icon:'TEMU',type:'temu',countries:{NG:'unknown',GH:'unknown',KE:'unknown',ZA:'product-dependent',EG:'unknown',MA:'unknown',UG:'unknown',SN:'unknown',CI:'unknown'}},
];

export const categories = [
 ['electronics','💻','Electronics'],['phones','📱','Phones'],['laptops','💻','Laptops'],['fashion','👕','Fashion'],['shoes','👟','Shoes'],['beauty','💄','Beauty'],['home-living','🛋️','Home & Living'],['sports','⚽','Sports'],['toys','🧸','Toys'],['automotive','🚙','Automotive'],['books','📚','Books'],['audio','🎧','Audio']
] as const;
export const brands=['Apple','Samsung','Nike','Adidas','Dell','HP','Canon','Sony'];

const offer = (merchant:string, price:number, status:AvailabilityStatus, currency='USD', deliveryNote?:string, oldPrice?:number):MerchantOffer => ({merchant,price,status,currency,deliveryNote,oldPrice});

export const products:Product[] = [
 {slug:'apple-airpods-pro-2',name:'Apple AirPods Pro (2nd Gen)',category:'Audio',brand:'Apple',icon:'🎧',price:179,oldPrice:309,rating:4.8,reviews:2184,merchant:'Amazon',discount:42,description:'Premium wireless earbuds with active noise cancellation and a compact charging case.',tags:['wireless','noise cancellation','apple'],offers:[offer('Amazon',179,'product-dependent','USD','Destination checked on merchant site',309),offer('eBay',185,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'samsung-galaxy-s24',name:'Samsung Galaxy S24',category:'Phones',brand:'Samsung',icon:'📱',price:649,oldPrice:999,rating:4.7,reviews:1450,merchant:'Amazon',discount:35,description:'A flagship Android smartphone with a bright display, advanced camera system and long battery life.',tags:['android','5g','smartphone'],offers:[offer('Amazon',649,'product-dependent','USD','Destination checked on merchant site',999),offer('JUMIA',695,'available','USD','Local marketplace availability') ]},
 {slug:'lenovo-ideapad-3',name:'Lenovo IdeaPad 3 Laptop',category:'Laptops',brand:'Lenovo',icon:'💻',price:429,oldPrice:599,rating:4.6,reviews:892,merchant:'JUMIA',discount:28,description:'Everyday laptop designed for study, work, browsing and entertainment.',tags:['laptop','student','work'],offers:[offer('JUMIA',429,'available','USD','Local marketplace availability',599),offer('AliExpress',410,'product-dependent','USD','Seller and product dependent') ]},
 {slug:'samsung-galaxy-watch-6',name:'Samsung Galaxy Watch 6',category:'Wearables',brand:'Samsung',icon:'⌚',price:199,oldPrice:299,rating:4.7,reviews:702,merchant:'Amazon',discount:33,description:'Smartwatch with fitness tracking, notifications and health-focused features.',tags:['watch','fitness','samsung'],offers:[offer('Amazon',199,'product-dependent','USD','Destination checked on merchant site',299),offer('eBay',205,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'nike-air-force-1',name:'Nike Air Force 1',category:'Shoes',brand:'Nike',icon:'👟',price:89,oldPrice:145,rating:4.8,reviews:3290,merchant:'eBay',discount:38,description:'Classic everyday sneakers with a clean silhouette and comfortable cushioning.',tags:['sneakers','nike','fashion'],offers:[offer('eBay',89,'product-dependent','USD','Seller-dependent delivery',145),offer('JUMIA',96,'available','USD','Local marketplace availability') ]},
 {slug:'apple-iphone-15',name:'Apple iPhone 15',category:'Phones',brand:'Apple',icon:'📱',price:699,oldPrice:799,rating:4.8,reviews:3910,merchant:'JUMIA',discount:13,description:'Modern iPhone with a high-resolution camera system and USB-C connectivity.',tags:['iphone','apple','5g'],offers:[offer('JUMIA',699,'available','USD','Local marketplace availability',799),offer('eBay',670,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'sony-wh-1000xm5',name:'Sony WH-1000XM5 Headphones',category:'Audio',brand:'Sony',icon:'🎧',price:299,oldPrice:399,rating:4.8,reviews:1760,merchant:'Amazon',discount:25,description:'Premium over-ear headphones with immersive sound and noise cancellation.',tags:['headphones','sony','audio'],offers:[offer('Amazon',299,'product-dependent','USD','Destination checked on merchant site',399),offer('eBay',285,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'dell-inspiron-15',name:'Dell Inspiron 15',category:'Laptops',brand:'Dell',icon:'💻',price:579,oldPrice:699,rating:4.5,reviews:611,merchant:'AliExpress',discount:17,description:'Versatile laptop for productivity, schoolwork and everyday computing.',tags:['dell','laptop','office'],offers:[offer('AliExpress',579,'product-dependent','USD','Seller and product dependent',699),offer('eBay',595,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'adidas-ultraboost',name:'Adidas Ultraboost',category:'Shoes',brand:'Adidas',icon:'👟',price:109,oldPrice:180,rating:4.7,reviews:1288,merchant:'eBay',discount:39,description:'Cushioned running shoes designed for daily comfort and active use.',tags:['running','adidas','shoes'],offers:[offer('eBay',109,'product-dependent','USD','Seller-dependent delivery',180),offer('JUMIA',115,'available','USD','Local marketplace availability') ]},
 {slug:'canon-eos-r50',name:'Canon EOS R50 Camera',category:'Electronics',brand:'Canon',icon:'📷',price:679,oldPrice:799,rating:4.6,reviews:445,merchant:'TEMU',discount:15,description:'Compact mirrorless camera for creators, photography and video.',tags:['camera','canon','creator'],offers:[offer('TEMU',679,'unknown','USD','Confirm destination at merchant checkout',799),offer('eBay',690,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'apple-macbook-air-m3',name:'MacBook Air M3',category:'Laptops',brand:'Apple',icon:'💻',price:999,oldPrice:1199,rating:4.9,reviews:2210,merchant:'Amazon',discount:17,description:'Lightweight performance laptop powered by Apple silicon.',tags:['macbook','apple','m3'],offers:[offer('Amazon',999,'product-dependent','USD','Destination checked on merchant site',1199),offer('eBay',1020,'product-dependent','USD','Seller-dependent delivery') ]},
 {slug:'samsung-galaxy-tab-s9',name:'Samsung Galaxy Tab S9',category:'Electronics',brand:'Samsung',icon:'📱',price:599,oldPrice:799,rating:4.7,reviews:740,merchant:'JUMIA',discount:25,description:'Premium tablet for entertainment, productivity and creative work.',tags:['tablet','samsung','android'],offers:[offer('JUMIA',599,'available','USD','Local marketplace availability',799),offer('AliExpress',560,'product-dependent','USD','Seller and product dependent') ]}
];

export const deals=products.filter(p=>p.discount).slice(0,8);
export const productBySlug=(slug:string)=>products.find(p=>p.slug===slug);
export const countryByCode=(code='NG')=>countries.find(c=>c.code===code.toUpperCase()) || countries[0];
export const merchantBySlug=(slug:string)=>merchants.find(m=>m.slug===slug);
export function merchantStatus(merchant:string,countryCode='NG'):AvailabilityStatus { const m=merchants.find(x=>x.name.toLowerCase()===merchant.toLowerCase()||x.slug===merchant.toLowerCase()); return m?.countries[countryCode.toUpperCase()] || 'unknown'; }
export function productStatus(product:Product,countryCode='NG'):AvailabilityStatus { const offers=product.offers||[]; const statuses=offers.map(o=>o.status==='available'?merchantStatus(o.merchant,countryCode):merchantStatus(o.merchant,countryCode)==='not-available'?'not-available':o.status); if(statuses.includes('available')) return 'available'; if(statuses.includes('product-dependent')) return 'product-dependent'; if(statuses.includes('limited')) return 'limited'; if(statuses.some(x=>x==='unknown')) return 'unknown'; return 'not-available'; }
export function statusLabel(status:AvailabilityStatus){ return ({available:'Ships to destination',limited:'Limited availability','product-dependent':'Check product delivery','not-available':'Not available for destination',unknown:'Destination not verified'} as Record<AvailabilityStatus,string>)[status]; }
