-- このコマンドで、ログインを邪魔している「古いユーザー情報」だけを消去します
DELETE FROM auth.users WHERE email = 'oshirokazuki@aim.com';
