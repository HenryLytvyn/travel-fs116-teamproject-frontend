import Link from 'next/link';
import css from './Logo.module.css';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link className={css.logoLink} href="#">
      <Image
        src="/icons/logo-icon.svg"
        alt="Логотип компанії"
        width={22.4}
        height={22.4}
      />
      <span className={css.logoText}>Подорожники</span>
    </Link>
  );
}
