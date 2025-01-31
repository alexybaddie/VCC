/* app.js */

// If using Fluent's dark/light mode switching:
import { baseLayerLuminance, StandardLuminance } from 'https://unpkg.com/@fluentui/web-components';

// Adjust this if your environment injects the listing URL via Mustache
const LISTING_URL = "{{ listingInfo.Url }}";

/*
  If you want to gather your package data from Mustache, you could do something like:

  const PACKAGES = {
    {{~ for package in packages ~}}
      "{{ package.Name }}": {
        name: "{{ package.Name }}",
        displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
        description: "{{ if package.Description; package.Description; end; }}",
        // ...
        zipUrl: "{{ package.ZipUrl }}",
      },
    {{~ end ~}}
  };

  Or you can simply rely on the data attributes your Mustache inserted in the HTML
  (like `data-package-id="{{ package.Name }}"`).
*/

function setTheme() {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // If using the Fluent theming approach:
  setTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);

  // 1) "Add listing to VCC" main button
  const vccAddRepoButton = document.getElementById('vccAddRepoButton');
  if (vccAddRepoButton) {
    vccAddRepoButton.addEventListener('click', () => {
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  }

  // 2) Copy button on the main listing bar
  const vccUrlFieldCopy = document.getElementById('vccUrlFieldCopy');
  if (vccUrlFieldCopy) {
    vccUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = document.getElementById('vccUrlField');
      if (!vccUrlField) return;

      // If you want the fancy "Copied!" text switch:
      const originalHtml = vccUrlFieldCopy.innerHTML;
      vccUrlFieldCopy.innerHTML = `<img class="w-4 h-4 mr-1" src="./images/copy.svg" alt="" /> Copied!`;

      navigator.clipboard.writeText(vccUrlField.value);

      setTimeout(() => {
        vccUrlFieldCopy.innerHTML = originalHtml;
      }, 2000);
    });
  }

  // 3) “How to add to VCC” dialog
  const urlBarHelp = document.getElementById('urlBarHelp');
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  const addListingToVccHelpClose = document.getElementById('addListingToVccHelpClose');
  if (urlBarHelp && addListingToVccHelp) {
    urlBarHelp.addEventListener('click', () => { addListingToVccHelp.hidden = false; });
    addListingToVccHelpClose?.addEventListener('click', () => {
      addListingToVccHelp.hidden = true;
    });
  }

  // 4) Copy button inside the help dialog
  const vccListingInfoUrlFieldCopy = document.getElementById('vccListingInfoUrlFieldCopy');
  if (vccListingInfoUrlFieldCopy) {
    vccListingInfoUrlFieldCopy.addEventListener('click', () => {
      const vccUrlField = document.getElementById('vccListingInfoUrlField');
      if (!vccUrlField) return;
      vccUrlField.select();
      navigator.clipboard.writeText(vccUrlField.value);
      vccListingInfoUrlFieldCopy.appearance = 'accent';
      setTimeout(() => {
        vccListingInfoUrlFieldCopy.appearance = 'neutral';
      }, 1000);
    });
  }

  // 5) Search field logic
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase();
      const packageRows = document.querySelectorAll('#packages > div[data-package-id]');
      packageRows.forEach(row => {
        const name = row.dataset.packageName.toLowerCase() || '';
        const id   = row.dataset.packageId.toLowerCase()   || '';
        // Show/hide if either matches search
        if (value === '' || name.includes(value) || id.includes(value)) {
          row.style.display = 'grid'; // or 'flex'; we’re using Tailwind’s grid
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 6) Per-package "Add to VCC" button
  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Example: You might use the *package-specific* listing .json if you want:
      //  vcc://vpm/addRepo?url=encodeURI(.../packageId.json)
      // Or you can always just add the top-level listing:
      window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
    });
  });

  // 7) “Info” button modals (if you want them)
  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach(button => {
    button.addEventListener('click', (e) => {
      const pkgId = e.currentTarget.dataset.packageId;
      console.log("Clicked info for package:", pkgId);
      // If you want a modal, you can open a Fluent dialog, fill in data, etc.
      // For now, just a console log or a custom approach:
    });
  });

  // 8) “Download ZIP” or “More” button
  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  rowMenuButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const zipUrl = e.currentTarget.dataset.packageUrl;
      if (!zipUrl) {
        alert("No zip URL provided");
        return;
      }
      window.open(zipUrl, '_blank');
    });
  });
});
