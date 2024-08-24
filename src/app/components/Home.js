import Navbar from './Navbar'; 
function HomePage() {


  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <Navbar /> 
      <div className="flex flex-col items-center justify-center p-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8">RatioVid</h1>
      </div>
    </div>
  );
}

export default HomePage;
