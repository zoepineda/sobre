-- Optional LineIcons icon per envelope (e.g. 'lni-shield-2'); '' = none.
alter table categories add column icon text not null default '';
