function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer-inner">
        <span>
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-gradient-blue fw-bold">FlowState.</span> All
          rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default HomeFooter;
