const App = () => {
  return (
    <div>
      <h1>Welcome to the Invoice App!!!</h1>
    </div>
  );
};

export default App;

// Passing usePolling to the server.watch options in the Vite config worked for me on Docker WSL2:

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   server: {
//     watch: {
//       usePolling: true
//     }
//   }
// })
// I found this out by exploring the latest Vite server config docs.
// This workaround is required simply because of the way WSL currently works with the Windows filesystem.
// If you move your files into the Linux filesystem, you won't have this problem and possibly save yourself from a couple others
