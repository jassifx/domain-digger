import type { Metadata } from 'next';
import Link from 'next/link';
import { type FC, Fragment } from 'react';

import { getBaseDomain } from '@/lib/utils';
import { lookupWhois } from '@/lib/whois';

type WhoisResultsPageProps = {
  params: Promise<{
    domain: string;
  }>;
  searchParams: Promise<{
    force?: string;
  }>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: WhoisResultsPageProps): Promise<Metadata> => {
  const { domain } = await params;
  const { force } = await searchParams;

  const search = force !== undefined ? '?force' : '';

  return {
    title: `WHOIS Lookup for ${domain}`,
    openGraph: {
      title: `WHOIS Lookup for ${domain}`,
      url: `/lookup/${domain}/whois${search}`,
    },
    alternates: {
      canonical: `/lookup/${domain}/whois${search}`,
    },
  };
};

const WhoisResultsPage: FC<WhoisResultsPageProps> = async ({
  params,
  searchParams,
}) => {
  const { domain } = await params;
  const { force } = await searchParams;

  const forceOriginal = force !== undefined;
  const baseDomain = getBaseDomain(domain);
  const results = await lookupWhois(forceOriginal ? domain : baseDomain);

  if (results.length === 0) {
    throw new Error('No results found');
  }

  return (
    <>
      {baseDomain !== domain &&
        (force !== undefined ? (
          <>
            <p className="mt-8 text-zinc-500 dark:text-zinc-400">
              Forcing lookup for {domain}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              Lookup{' '}
              <Link
                className="underline decoration-dotted underline-offset-4"
                href={`/lookup/${domain}/whois`}
              >
                {baseDomain} instead
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="mt-8 text-zinc-500 dark:text-zinc-400">
              Showing results for {baseDomain}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              Force lookup for{' '}
              <Link
                className="underline decoration-dotted underline-offset-4"
                href={`/lookup/${domain}/whois?force`}
              >
                {domain} instead
              </Link>
            </p>
          </>
        ))}

      {results.map(([key, value]) => (
        <Fragment key={key}>
          <h2 className="mt-8 mb-4 text-3xl font-bold tracking-tight">{key}</h2>
          <code className="break-words">
            {value.split('\n').map((line) => (
              // eslint-disable-next-line react/jsx-key
              <p>{line}</p>
            ))}
          </code>
        </Fragment>
      ))}
    </>
  );
};

export default WhoisResultsPage;
