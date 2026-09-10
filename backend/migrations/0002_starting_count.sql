-- Owner-requested starting baseline; subsequent verified sessions are additive.
UPDATE totals SET count=count+723 WHERE scope IN ('public','preview');
