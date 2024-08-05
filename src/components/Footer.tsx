type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All right reserved by Chat
          App
        </p>
      </aside>
    </footer>
  );
};

export { Footer };
