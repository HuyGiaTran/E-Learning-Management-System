import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  trimValues: true,
});

/**
 * Tìm file imsmanifest.xml trong thư mục đã giải nén (gốc hoặc một cấp con).
 */
export function findImsManifestPath(rootDir) {
  const manifestName = (name) => name.toLowerCase() === 'imsmanifest.xml';

  const tryDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const direct = entries.find((e) => e.isFile() && manifestName(e.name));
    if (direct) return path.join(dir, direct.name);

    const subdirs = entries.filter((e) => e.isDirectory());
    if (subdirs.length === 1) {
      const nested = tryDir(path.join(dir, subdirs[0].name));
      if (nested) return nested;
    }
    for (const d of subdirs) {
      const nested = tryDir(path.join(dir, d.name));
      if (nested) return nested;
    }
    return null;
  };

  return tryDir(rootDir);
}

function firstAttr(obj, keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== '') return obj[k];
  }
  return undefined;
}

function normalizeItems(itemNode) {
  if (!itemNode) return [];
  return Array.isArray(itemNode) ? itemNode : [itemNode];
}

/** DFS: item đầu tiên có identifierref */
function findFirstIdentifierRef(itemNode) {
  for (const it of normalizeItems(itemNode)) {
    const ref = firstAttr(it, ['@_identifierref', '@_identifierRef']);
    if (ref) return ref;
    const nested = findFirstIdentifierRef(it.item);
    if (nested) return nested;
  }
  return null;
}

function normalizeResources(resourceNode) {
  if (!resourceNode) return [];
  return Array.isArray(resourceNode) ? resourceNode : [resourceNode];
}

function isScoResource(res) {
  const st = firstAttr(res, [
    '@_adlcp:scormtype',
    '@_adlcp:scormType',
    '@_scormtype',
    '@_scormType',
  ]);
  if (st && String(st).toLowerCase() === 'sco') return true;
  const type = firstAttr(res, ['@_type', '@_Type']);
  return type === 'webcontent' && Boolean(firstAttr(res, ['@_href', '@_Href']));
}

/**
 * Đọc imsmanifest.xml, trả về đường dẫn entry (POSIX, tương đối thư mục chứa manifest).
 */
export function resolveScormLaunchHref(manifestAbsPath) {
  const xml = fs.readFileSync(manifestAbsPath, 'utf8');
  const doc = xmlParser.parse(xml);
  const manifest = doc.manifest;
  if (!manifest) {
    throw new Error('File manifest không hợp lệ (thiếu manifest)');
  }

  const orgs = manifest.organizations;
  if (!orgs) {
    throw new Error('Manifest thiếu organizations');
  }

  const defaultOrgId = firstAttr(orgs, ['@_default', '@_Default']);
  const orgList = normalizeItems(orgs.organization);
  if (!orgList.length) {
    throw new Error('Manifest không có organization');
  }

  const organization =
    (defaultOrgId &&
      orgList.find((o) => firstAttr(o, ['@_identifier', '@_Identifier']) === defaultOrgId)) ||
    orgList[0];

  const identifierRef = findFirstIdentifierRef(organization.item);
  const resourcesBlock = manifest.resources;
  const resList = normalizeResources(resourcesBlock?.resource);

  let resource = null;
  if (identifierRef) {
    resource = resList.find(
      (r) => firstAttr(r, ['@_identifier', '@_Identifier']) === identifierRef
    );
  }
  if (!resource) {
    resource = resList.find((r) => isScoResource(r) && firstAttr(r, ['@_href', '@_Href']));
  }
  if (!resource) {
    resource = resList.find((r) => firstAttr(r, ['@_href', '@_Href']));
  }

  const href = firstAttr(resource || {}, ['@_href', '@_Href']);
  if (!href) {
    throw new Error('Không tìm thấy file chạy chính (resource href) trong imsmanifest.xml');
  }

  const normalized = href.replace(/\\/g, '/');
  if (normalized.includes('..')) {
    throw new Error('Đường dẫn entry không hợp lệ');
  }
  return normalized;
}

export function manifestDir(manifestAbsPath) {
  return path.dirname(manifestAbsPath);
}
