type Props = { children: React.ReactNode };

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex w-full min-w-[1215px] h-screen">
        <div className="px-8 my-8 w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
